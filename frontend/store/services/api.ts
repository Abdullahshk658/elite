import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CategoryNode, OrderPayload, ProductListResponse } from '@/lib/types';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Products', 'Order', 'Categories'],
  endpoints: (builder) => ({
    getProducts: builder.query<
      ProductListResponse,
      {
        page?: number;
        limit?: number;
        sort?: string;
        brand?: string;
        size?: string;
        minPrice?: number;
        maxPrice?: number;
        qualityTag?: string;
        category?: string;
        featured?: boolean;
        trending?: boolean;
        search?: string;
      }
    >({
      query: (params) => ({
        url: '/products',
        params
      }),
      providesTags: ['Products']
    }),
    getProductBySlug: builder.query<any, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: ['Products']
    }),
    searchProducts: builder.query<any[], string>({
      query: (q) => ({
        url: '/products/search',
        params: { q }
      })
    }),
    getCategoriesTree: builder.query<CategoryNode[], void>({
      query: () => '/categories/tree',
      providesTags: ['Categories']
    }),
    createOrder: builder.mutation<any, OrderPayload>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Order']
    })
  })
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useSearchProductsQuery,
  useGetCategoriesTreeQuery,
  useCreateOrderMutation
} = api;
