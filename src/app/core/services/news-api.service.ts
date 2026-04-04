import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { News, PaginatedNews, NewsCategory } from '../models/news.model';

@Injectable({
  providedIn: 'root',
})
export class NewsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/news`;

  findAll(query: { search?: string; status?: string; page?: number; limit?: number } = {}): Observable<PaginatedNews> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<PaginatedNews>(this.apiUrl, { params });
  }

  findOne(id: string): Observable<News> {
    return this.http.get<News>(`${this.apiUrl}/${id}`);
  }

  create(payload: Partial<News>): Observable<News> {
    return this.http.post<News>(this.apiUrl, payload);
  }

  update(id: string, news: Partial<News>): Observable<News> {
    return this.http.patch<News>(`${this.apiUrl}/${id}`, news);
  }

  deleteNews(id: string, hard: boolean = false): Observable<void> {
    const params = new HttpParams().set('hard', hard.toString());
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }

  getCategories(): Observable<NewsCategory[]> {
    return this.http.get<NewsCategory[]>(`${environment.apiBaseUrl}/public-news/categories`);
  }

  createCategory(name: string, description?: string): Observable<NewsCategory> {
    return this.http.post<NewsCategory>(`${this.apiUrl}/categories`, { name, description });
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  incrementView(slug: string): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/public-news/${slug}/view`, {});
  }

  uploadImage(file: File): Observable<{ success: number; file: { url: string } }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ success: number; file: { url: string } }>(`${this.apiUrl}/upload-image`, formData);
  }

  getPublicBySlug(slug: string): Observable<News> {
    return this.http.get<News>(`${environment.apiBaseUrl}/public-news/${slug}`);
  }

  getPublicNews(query: { page?: number; limit?: number; category?: string; search?: string } = {}): Observable<PaginatedNews> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<PaginatedNews>(`${environment.apiBaseUrl}/public-news`, { params });
  }

  // --- Engagement Methods ---

  getLikeStatus(slug: string): Observable<{ liked: boolean }> {
    return this.http.get<{ liked: boolean }>(`${environment.apiBaseUrl}/public-news/${slug}/like-status`);
  }

  toggleLike(slug: string): Observable<{ liked: boolean; totalLikes: number }> {
    return this.http.post<{ liked: boolean; totalLikes: number }>(`${environment.apiBaseUrl}/public-news/${slug}/like`, {});
  }

  getComments(slug: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/public-news/${slug}/comments`);
  }

  addComment(slug: string, content: string): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}/public-news/${slug}/comments`, { content });
  }

  getRelated(slug: string, limit: number = 3): Observable<News[]> {
    return this.http.get<News[]>(`${environment.apiBaseUrl}/public-news/${slug}/related`, {
      params: new HttpParams().set('limit', limit.toString())
    });
  }

  subscribeNewsletter(email: string): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}/newsletter/subscribe`, { email });
  }

  getSubscribers(query: { page?: number; limit?: number; status?: string; search?: string } = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<any>(`${environment.apiBaseUrl}/newsletter`, { params });
  }

  getNewsletterStats(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/newsletter/stats`);
  }
}
