import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

async function main() {
  console.log('🌱 Начинаем генерацию тестовых данных...');

  // 1. Создаём районы
  console.log('📍 Создаём районы...');
  const districts = [
    { name: 'Kentron', slug: 'kentron' },
    { name: 'Arabkir', slug: 'arabkir' },
    { name: 'Malatia', slug: 'malatia' },
    { name: 'Avan', slug: 'avan' },
    { name: 'Nor Nork', slug: 'nor-nork' },
  ];

  const createdDistricts = [];
  for (const district of districts) {
    const created = await prisma.district.upsert({
      where: { slug: district.slug },
      update: {},
      create: district,
    });
    createdDistricts.push(created);
  }
  console.log(`✅ Создано районов: ${createdDistricts.length}`);

  // 2. Создаём здания (по 3-4 здания в каждом районе)
  console.log('🏢 Создаём здания...');
  const buildings = [];
  for (const district of createdDistricts) {
    const buildingCount = 3 + Math.floor(Math.random() * 2); // 3-4 здания
    for (let i = 1; i <= buildingCount; i++) {
      const building = await prisma.building.upsert({
        where: {
          districtId_slug: {
            districtId: district.id,
            slug: `${district.slug}-building-${i}`,
          },
        },
        update: {},
        create: {
          districtId: district.id,
          name: `${district.name} Building ${i}`,
          slug: `${district.slug}-building-${i}`,
        },
      });
      buildings.push(building);
    }
  }
  console.log(`✅ Создано зданий: ${buildings.length}`);

  // 3. Генерируем 320 квартир
  console.log('🏠 Генерируем 320 квартир...');
  const statuses: Array<'UPCOMING' | 'AVAILABLE' | 'RESERVED' | 'SOLD'> = [
    'UPCOMING',
    'AVAILABLE',
    'AVAILABLE',
    'AVAILABLE',
    'RESERVED',
    'RESERVED',
    'SOLD',
    'SOLD',
  ];
  const salesTypes: Array<'UNSOLD' | 'MORTGAGE' | 'CASH' | 'TIMEBASED'> = [
    'UNSOLD',
    'MORTGAGE',
    'CASH',
    'TIMEBASED',
  ];
  const apartmentTypes = [1, 2, 3, 4];

  let created = 0;
  const batchSize = 50;

  for (let i = 0; i < 320; i += batchSize) {
    const batch: Prisma.ApartmentCreateManyInput[] = [];
    const end = Math.min(i + batchSize, 320);

    for (let j = i; j < end; j++) {
      const building = buildings[Math.floor(Math.random() * buildings.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const apartmentType = apartmentTypes[Math.floor(Math.random() * apartmentTypes.length)];
      const floor = Math.floor(Math.random() * 20) + 1;
      const apartmentNo = `${floor}-${String(j % 100).padStart(2, '0')}`;

      // Генерируем площадь и цену
      const sqm = new Prisma.Decimal(40 + Math.random() * 60); // 40-100 м²
      const priceSqm = new Prisma.Decimal(500000 + Math.random() * 300000); // 500K-800K AMD
      const totalPrice = new Prisma.Decimal(Number(sqm) * Number(priceSqm));

      const apartmentData: Prisma.ApartmentCreateManyInput = {
        buildingId: building.id,
        apartmentNo,
        apartmentType,
        status,
        sqm,
        priceSqm,
        totalPrice,
        salesType: status === 'SOLD' 
          ? salesTypes[Math.floor(Math.random() * salesTypes.length)]
          : 'UNSOLD',
      };

      // Для проданных и зарезервированных добавляем данные
      if (status === 'SOLD' || status === 'RESERVED') {
        apartmentData.ownershipName = `Owner ${j + 1}`;
        apartmentData.email = `owner${j + 1}@example.com`;
        apartmentData.phone = `+374${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`;
        apartmentData.totalPaid = status === 'SOLD' 
          ? totalPrice 
          : new Prisma.Decimal(Number(totalPrice) * 0.2); // 20% для reserved
        if (status === 'SOLD') {
          apartmentData.dealDate = new Date(
            2024 + Math.floor(Math.random() * 2),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          );
        }
      }

      batch.push(apartmentData);
    }

    // Вставляем батчами для производительности
    await prisma.apartment.createMany({
      data: batch,
      skipDuplicates: true,
    });
    created += batch.length;
    console.log(`   Создано квартир: ${created}/320`);
  }

  // Итоговая статистика
  const stats = {
    districts: await prisma.district.count(),
    buildings: await prisma.building.count(),
    apartments: await prisma.apartment.count(),
    apartmentsByStatus: {
      upcoming: await prisma.apartment.count({ where: { status: 'UPCOMING' } }),
      available: await prisma.apartment.count({ where: { status: 'AVAILABLE' } }),
      reserved: await prisma.apartment.count({ where: { status: 'RESERVED' } }),
      sold: await prisma.apartment.count({ where: { status: 'SOLD' } }),
    },
  };

  console.log('\n📊 Статистика:');
  console.log(`   Районов: ${stats.districts}`);
  console.log(`   Зданий: ${stats.buildings}`);
  console.log(`   Квартир: ${stats.apartments}`);
  console.log(`   - Upcoming: ${stats.apartmentsByStatus.upcoming}`);
  console.log(`   - Available: ${stats.apartmentsByStatus.available}`);
  console.log(`   - Reserved: ${stats.apartmentsByStatus.reserved}`);
  console.log(`   - Sold: ${stats.apartmentsByStatus.sold}`);

  console.log('\n✅ Тестовые данные успешно сгенерированы!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
