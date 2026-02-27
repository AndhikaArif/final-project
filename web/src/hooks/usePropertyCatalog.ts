"use client";

import { useEffect, useState } from "react";
import {
  getPropertyCatalog,
  CatalogParams,
} from "@/services/property-catalog.service";

interface CatalogItem {
  id: string;
  name: string;
  city: string;
  image?: string;
  lowestPrice?: number;
}

interface CatalogMeta {
  page: number;
  totalPages: number;
  total: number;
}

export function usePropertyCatalog(params: CatalogParams) {
  const [data, setData] = useState<CatalogItem[]>([]);
  const [meta, setMeta] = useState<CatalogMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        setLoading(true);
        const res = await getPropertyCatalog(params);
        setData(res.data);
        setMeta(res.meta);
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, [params]);

  return { data, meta, loading };
}
