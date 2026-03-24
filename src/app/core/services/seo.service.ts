import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { News } from '../models/news.model';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  updateArticleSeo(article: News) {
    const title = `${article.title} | Portal Pelotas`;
    const description = article.subtitle || article.title;
    const url = `${window.location.origin}/noticias/${article.slug}`;
    const image = article.coverImageUrl || `${window.location.origin}/assets/og-image.jpg`;

    // Basic Meta Tags
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'article' });

    // Twitter
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    // Article Meta
    if (article.publishedAt) {
      this.meta.updateTag({ property: 'article:published_time', content: new Date(article.publishedAt).toISOString() });
    }
    if (article.categories?.length > 0) {
      this.meta.updateTag({ property: 'article:section', content: article.categories[0] });
    }

    // JSON-LD Structured Data
    this.injectJsonLd(article, url, image);
  }

  private injectJsonLd(article: News, url: string, image: string) {
    // Remove existing JSON-LD if any
    const existingScript = this.document.getElementById('article-json-ld');
    if (existingScript) {
      existingScript.remove();
    }

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "image": [image],
      "datePublished": article.publishedAt || article.createdAt,
      "dateModified": article.updatedAt || article.publishedAt || article.createdAt,
      "author": [{
        "@type": "Person",
        "name": article.authorDisplayName || article.author?.name || "Redação Pelotas",
        "url": url
      }],
      "publisher": {
        "@type": "Organization",
        "name": "Esporte Clube Pelotas",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/assets/logo.png`
        }
      },
      "description": article.subtitle || article.title,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url
      }
    };

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'article-json-ld';
    script.text = JSON.stringify(jsonLd);
    this.document.head.appendChild(script);
  }
}
