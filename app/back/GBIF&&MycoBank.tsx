import axios from "axios";

// GBIFのレスポンス型定義
interface GBIFSpeciesMatchResponse {
  usageKey?: number;
  scientificName: string;
  rank: string;
  status: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
  confidence?: number;
}

// MycoBankのレスポンス型定義（例）
interface MycoBankSpeciesResponse {
  name: string;
  description: string;
  imageUrl?: string;
}

// 両方のAPI統合用の型
interface CombinedFungiData {
  scientificName: string;
  rank: string;
  status: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
  confidence?: number;
  mycoBankDescription?: string;
  mycoBankImageUrl?: string;
}

// axiosインスタンスの作成
const gbifClient = axios.create({
  baseURL: "https://api.gbif.org/v1/",
  timeout: 5000,
});

const mycoBankClient = axios.create({
  baseURL: "https://www.mycobank.org/api/",
  timeout: 5000,
});

// GBIFのデータ取得関数
async function fetchFromGBIF(
  scientificName: string
): Promise<GBIFSpeciesMatchResponse | null> {
  try {
    const response = await gbifClient.get<GBIFSpeciesMatchResponse>(
      "species/match",
      {
        params: { name: scientificName, rank: "species" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("GBIF API Error:", error);
    return null;
  }
}

// MycoBankのデータ取得関数（例）
async function fetchFromMycoBank(
  scientificName: string
): Promise<MycoBankSpeciesResponse | null> {
  try {
    const response = await mycoBankClient.get<MycoBankSpeciesResponse>(
      "species",
      {
        params: { name: scientificName },
      }
    );
    return response.data;
  } catch (error) {
    console.error("MycoBank API Error:", error);
    return null;
  }
}

// 両方のデータを統合する関数
async function fetchCombinedFungiData(
  scientificName: string
): Promise<CombinedFungiData | null> {
  const gbifData = await fetchFromGBIF(scientificName);
  const mycoBankData = await fetchFromMycoBank(scientificName);

  if (!gbifData) {
    console.warn("GBIF data not found");
    return null;
  }

  return {
    scientificName: gbifData.scientificName,
    rank: gbifData.rank,
    status: gbifData.status,
    kingdom: gbifData.kingdom,
    phylum: gbifData.phylum,
    class: gbifData.class,
    order: gbifData.order,
    family: gbifData.family,
    genus: gbifData.genus,
    species: gbifData.species,
    confidence: gbifData.confidence,
    mycoBankDescription: mycoBankData?.description ?? undefined, // null -> undefined
    mycoBankImageUrl: mycoBankData?.imageUrl ?? undefined, // null -> undefined
  };
}

// メイン関数
async function main() {
  const scientificName = "Agaricus bisporus"; // 例: マッシュルームの学名
  const combinedData = await fetchCombinedFungiData(scientificName);

  if (combinedData) {
    console.log("Combined Fungi Data:", combinedData);
  } else {
    console.log("No data found for the given scientific name.");
  }
}

main();
