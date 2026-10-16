require "time"

module SiteMetadataGenerator
  class Generator < Jekyll::Generator
    safe true
    priority :lowest

    # 允许路径以带空格的 "{{ site.baseurl }}" 开头，否则封面会被截成 "{{"
    IMAGE_PATTERN = %r{!\[[^\]]*\]\(((?:\{\{\s*site\.baseurl\s*\}\})?[^)\s]+)}.freeze
    HTML_IMAGE_PATTERN = %r{<img[^>]+src=["']([^"']+)["']}.freeze
    EXCERPT_PATTERN = %r{<\/?[^>]*>}.freeze

    def generate(site)
      (site.posts.docs + site.collections.fetch("chapters").docs).each do |doc|
        enrich_document(site, doc)
      end

      site.posts.docs.select { |doc| doc.data["book"] }.each do |doc|
        chapters = site.collections.fetch("chapters").docs.select { |chapter| chapter.data["book"] == doc.data["book"] }
        latest = ([doc] + chapters).max_by { |entry| entry.data["last_modified_at_iso"] }
        doc.data["last_modified_at"] = latest.data["last_modified_at"]
        doc.data["last_modified_at_iso"] = latest.data["last_modified_at_iso"]
        doc.data["home_sort_key"] = [latest.data["last_modified_at_iso"], doc.date.iso8601].join("|")
      end

      build_tag_index(site)
    end

    private

    def enrich_document(site, doc)
      source_path = File.join(site.source, doc.relative_path)
      return unless File.exist?(source_path)

      modified_at = git_modified_at(site, doc) || File.mtime(source_path).utc
      doc.data["last_modified_at"] ||= modified_at
      doc.data["last_modified_at_iso"] ||= modified_at.iso8601
      doc.data["home_sort_key"] ||= [doc.data["last_modified_at_iso"], doc.date.iso8601].join("|")
      doc.data["cover_image"] ||= extract_cover_image(doc)
      doc.data["home_excerpt"] ||= extract_excerpt(doc)
      if doc.collection.label == "chapters"
        rendered = site.find_converter_instance(Jekyll::Converters::Markdown).convert(doc.content)
        plain = rendered.gsub(EXCERPT_PATTERN, " ")
        # Chinese characters and space-separated words need different reading rates.
        doc.data["reading_minutes"] = [(plain.scan(/\p{Han}/).size / 400.0 + plain.scan(/[A-Za-z0-9]+/).size / 220.0).ceil, 1].max
      end
    end

    def git_modified_at(site, doc)
      output = IO.popen(
        ["git", "-C", site.source, "log", "-1", "--format=%cI", "--", doc.relative_path.to_s],
        err: File::NULL,
        &:read
      ).to_s.strip
      return nil if output.empty?

      Time.iso8601(output).utc
    rescue ArgumentError, Errno::ENOENT
      nil
    end

    def extract_cover_image(doc)
      header_image = doc.data["header-img"]
      return normalized_asset(header_image) if header_image && !header_image.empty?

      content = doc.content.to_s
      markdown_match = content.match(IMAGE_PATTERN)
      return normalized_asset(markdown_match[1]) if markdown_match

      html_match = content.match(HTML_IMAGE_PATTERN)
      return normalized_asset(html_match[1]) if html_match

      nil
    end

    def normalized_asset(value)
      value.to_s.strip.sub(%r{\A\{\{\s*site\.baseurl\s*\}\}}, "")
    end

    def extract_excerpt(doc)
      raw_excerpt = doc.data["subtitle"].to_s
      return raw_excerpt unless raw_excerpt.empty?

      plain = doc.content.to_s
        .gsub(IMAGE_PATTERN, " ")
        .gsub(HTML_IMAGE_PATTERN, " ")
        .gsub(EXCERPT_PATTERN, " ")
        .gsub(/[`*_>#-]/, " ")
        .gsub(/\s+/, " ")
        .strip

      plain[0, 120]
    end

    def build_tag_index(site)
      counts = Hash.new(0)
      visible_posts = site.posts.docs.reject { |doc| doc.data["hidden"] }

      visible_posts.each do |doc|
        Array(doc.data["tags"]).each do |tag|
          counts[tag.to_s] += 1
        end
      end

      site.config["visible_post_count"] = visible_posts.size
      site.config["tag_index"] = counts.map do |name, count|
        {
          "name" => name,
          "count" => count,
          "slug" => Jekyll::Utils.slugify(name.to_s, mode: "default")
        }
      end.sort_by { |entry| [-entry["count"], entry["name"]] }
    end
  end
end
