import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedBearer } from '@/lib/apiToken';
import { districtService } from '@/services/district.service';
import { buildingService } from '@/services/building.service';
import { handleRouteError } from '@/lib/apiErrorResponse';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!isAuthorizedBearer(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const district = await districtService.getBySlug(slug);

    if (!district) {
      return NextResponse.json(
        { error: 'District not found' },
        { status: 404 }
      );
    }

    const buildings = await buildingService.getAll(district.id);

    // Формат для внешнего API (как в спецификации)
    const buildingsWithSlug = buildings.map((building) => ({
      id: building.id,
      slug: building.slug,
      name: building.name,
      district_id: building.districtId,
      district_slug: district.slug,
      created_at: building.createdAt.toISOString(),
      updated_at: building.updatedAt.toISOString(),
    }));

    return NextResponse.json({ data: buildingsWithSlug });
  } catch (error) {
    return handleRouteError(request, '[API] Error fetching buildings by district slug', error);
  }
}
