import os
import re
import sys

# Ensure dependencies are available (markdown package is needed)
try:
    import markdown
except ImportError:
    print("Python 'markdown' package is not installed. Installing it now...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "markdown"])
    import markdown

posts_dir = "/home/alteredgenome/XTTBuilding/website/news/posts"
templates_dir = "/home/alteredgenome/XTTBuilding/website/news/templates"
output_dir = "/home/alteredgenome/XTTBuilding/website/news/posts"
index_file = "/home/alteredgenome/XTTBuilding/website/news/index.html"
template_file = "/home/alteredgenome/XTTBuilding/website/news/templates/post_template.html"

os.makedirs(posts_dir, exist_ok=True)
os.makedirs(templates_dir, exist_ok=True)

def parse_frontmatter(content):
    """Parses YAML-like frontmatter from markdown file."""
    yaml_data = {}
    markdown_body = content
    
    # Check for frontmatter block (starts and ends with ---)
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if match:
        frontmatter_text = match.group(1)
        markdown_body = content[match.end():]
        
        # Parse lines
        for line in frontmatter_text.split("\n"):
            if ":" in line:
                key, val = line.split(":", 1)
                yaml_data[key.strip()] = val.strip().strip('"').strip("'")
                
    return yaml_data, markdown_body

def compile_post(md_filename):
    """Compiles a single markdown post to an HTML file."""
    md_path = os.path.join(posts_dir, md_filename)
    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    frontmatter, body = parse_frontmatter(content)
    html_body = markdown.markdown(body)
    
    # Read template
    with open(template_file, "r", encoding="utf-8") as t:
        template = t.read()
        
    # Replace templates values
    title = frontmatter.get("title", "News Article")
    date = frontmatter.get("date", "Unknown Date")
    author = frontmatter.get("author", "XTT Team")
    summary = frontmatter.get("summary", "")
    
    output_html = template
    output_html = output_html.replace("{{title}}", title)
    output_html = output_html.replace("{{date}}", date)
    output_html = output_html.replace("{{author}}", author)
    output_html = output_html.replace("{{content}}", html_body)
    
    # Generate output slug
    slug = md_filename.replace(".md", ".html")
    output_path = os.path.join(output_dir, slug)
    
    with open(output_path, "w", encoding="utf-8") as out:
        out.write(output_html)
        
    print(f"Compiled: {md_filename} -> {slug}")
    return {
        "slug": slug,
        "title": title,
        "date": date,
        "author": author,
        "summary": summary
    }

def rebuild_index(posts_meta):
    """Rebuilds the website/news/index.html feed page."""
    # Sort posts by date descending
    posts_meta.sort(key=lambda x: x["date"], reverse=True)
    
    # Read feed index template if exists, or generate
    # We will generate a complete styled index page
    feed_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Latest News & Technology Press - XTT Ltd. Co.</title>
    <meta name="description" content="Read latest network announcements, service updates, SASE releases, and operational insights from XTT.">
    <link rel="stylesheet" href="../styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
</head>
<body class="light-theme">
    <!-- Navigation -->
    <header class="navbar" id="navbar">
        <div class="nav-container">
            <a href="../index.html" class="logo-link">
                <img id="logo-img" src="../images/SimpleLogoSmall.png" alt="XTT Logo" class="logo">
            </a>
            <nav class="nav-menu">
                <a href="../index.html" class="nav-item">Home</a>
                <div class="nav-item nav-item-dropdown">
                    <button class="dropdown-trigger">Solutions & Services</button>
                    <div class="dropdown-menu">
                        <a href="../sase.html" class="dropdown-item">Secure SASE Cloud</a>
                        <a href="../sdwan.html" class="dropdown-item">Managed SD-WAN</a>
                        <a href="../project_management.html" class="dropdown-item">Project Management</a>
                        <a href="../pen_testing.html" class="dropdown-item">Penetration Testing</a>
                        <a href="../ztna.html" class="dropdown-item">Zero Trust Access (ZTNA)</a>
                    </div>
                </div>
                <div class="nav-item nav-item-dropdown">
                    <button class="dropdown-trigger">About XTT</button>
                    <div class="dropdown-menu">
                        <a href="../about_us.html" class="dropdown-item">About Us</a>
                        <a href="../network.html" class="dropdown-item">Global Infrastructure</a>
                        <a href="../careers.html" class="dropdown-item">Careers</a>
                        <a href="../case_studies.html" class="dropdown-item">Case Studies</a>
                        <a href="../leadership.html" class="dropdown-item">Leadership</a>
                    </div>
                </div>
                <a href="index.html" class="nav-item active">News</a>
                <a href="../index.html#calculator" class="nav-item">ROI Planner</a>
                <a href="../index.html#contact" class="nav-item contact-btn">Get Started</a>
            </nav>
            <button id="theme-toggle" class="theme-toggle" aria-label="Toggle light/dark mode">
                <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>
        </div>
    </header>

    <!-- Hero Header -->
    <section class="subpage-hero">
        <div class="container">
            <h1 class="subpage-title">News & Insights</h1>
            <p class="subpage-subtitle">Announcements, technology insights, and operational updates from the XTT engineering team.</p>
        </div>
    </section>

    <!-- Feed Grid -->
    <section class="section-container" style="padding: 5rem 0;">
        <div class="container">
            <div class="news-grid">
"""
    
    # Add post cards
    for post in posts_meta:
        feed_html += f"""
                <article class="news-card glass">
                    <div class="news-date">{post["date"]} | By {post["author"]}</div>
                    <h2 class="news-card-title"><a href="posts/{post["slug"]}">{post["title"]}</a></h2>
                    <p class="news-card-summary">{post["summary"]}</p>
                    <a href="posts/{post["slug"]}" class="news-read-more">Read Full Article &rarr;</a>
                </article>
"""
        
    feed_html += """
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container footer-container">
            <div class="footer-left">
                <a href="../index.html" class="footer-logo"><span class="logo-bold">XTT</span><span class="logo-light">Ltd. Co.</span></a>
                <p>Enterprise intelligence and custom managed network services. Outsource billing, configure active carrier peering, and secure edge endpoints.</p>
                <div class="footer-copy">&copy; 2026 XTT Ltd. Co. All rights reserved.</div>
            </div>
            
            <div class="footer-links">
                <div class="footer-column">
                    <h4>Solutions</h4>
                    <a href="../sdwan.html">Managed SD-WAN</a>
                    <a href="../sase.html">SASE Secure Connect</a>
                    <a href="../ztna.html">Zero Trust (ZTNA)</a>
                    <a href="../pen_testing.html">Penetration Testing</a>
                    <a href="../project_management.html">Project Management</a>
                </div>
                <div class="footer-column">
                    <h4>Company</h4>
                    <a href="../about_us.html">About Us</a>
                    <a href="../network.html">Network Backbone</a>
                    <a href="../case_studies.html">Case Studies</a>
                    <a href="../careers.html">Careers</a>
                    <a href="../leadership.html">Leadership Team</a>
                </div>
                <div class="footer-column">
                    <h4>Legal & Policy</h4>
                    <a href="../terms_of_service.html">Terms of Service</a>
                    <a href="../acceptable_use_policy.html">Acceptable Use Policy</a>
                    <a href="../privacy_policy.html">Privacy Policy</a>
                </div>
            </div>
        </div>
    </footer>

    <script>
        // Theme switcher persistence
        const themeToggleBtn = document.getElementById('theme-toggle');
        const currentTheme = localStorage.getItem('theme') || 'light-theme';
        document.body.className = currentTheme;
        themeToggleBtn.textContent = currentTheme === 'dark-theme' ? '🌙' : '☀️';

        themeToggleBtn.addEventListener('click', () => {
            let theme = 'light-theme';
            if (document.body.classList.contains('light-theme')) {
                theme = 'dark-theme';
                themeToggleBtn.textContent = '🌙';
            } else {
                themeToggleBtn.textContent = '☀️';
            }
            document.body.className = theme;
            localStorage.setItem('theme', theme);
        });
    </script>
</body>
</html>
"""
    
    with open(index_file, "w", encoding="utf-8") as out:
        out.write(feed_html)
    print(f"Rebuilt index feed page: {index_file}")

def main():
    print("Starting XTT blog generator...")
    
    if not os.path.exists(template_file):
        print(f"Error: Template file not found: {template_file}")
        sys.exit(1)
        
    md_files = [f for f in os.listdir(posts_dir) if f.endswith(".md")]
    
    posts_meta = []
    for f in md_files:
        meta = compile_post(f)
        posts_meta.append(meta)
        
    rebuild_index(posts_meta)
    print("Blog builds completed successfully!")

if __name__ == "__main__":
    main()
