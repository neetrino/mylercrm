type Attachment = {
  id: number;
  fileType: string;
  fileUrl: string;
  fileName: string | null;
  fileSize: number | null;
  createdAt: string;
};

type LandingApartment = {
  id: number;
  apartmentNo: string;
  apartmentType: number | null;
  floor: number | null;
  status: string;
  sqm: number | null;
  price_sqm: number | null;
  total_price: number | null;
  total_paid: number | null;
  balance: number | null;
  dealDate: string | null;
  ownershipName: string | null;
  matterLink: string | null;
  floorplanDistribution: string | null;
  exteriorLink: string | null;
  exteriorLink2: string | null;
  building_name: string;
  district_name: string;
  notes: string | null;
  attachments: Attachment[];
};
