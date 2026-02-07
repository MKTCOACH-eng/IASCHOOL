import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addProducts() {
  const school = await prisma.school.findFirst();
  if (!school) {
    console.log('No school found');
    return;
  }
  console.log('Found school:', school.name);

  // Create or get categories
  let uniformes = await prisma.storeCategory.findFirst({ where: { schoolId: school.id, name: 'Uniformes' } });
  if (!uniformes) {
    uniformes = await prisma.storeCategory.create({
      data: { schoolId: school.id, name: 'Uniformes', description: 'Uniformes escolares oficiales', order: 1 }
    });
    console.log('Created category: Uniformes');
  }

  let libros = await prisma.storeCategory.findFirst({ where: { schoolId: school.id, name: 'Libros' } });
  if (!libros) {
    libros = await prisma.storeCategory.create({
      data: { schoolId: school.id, name: 'Libros', description: 'Libros de texto y material de lectura', order: 2 }
    });
    console.log('Created category: Libros');
  }

  let materiales = await prisma.storeCategory.findFirst({ where: { schoolId: school.id, name: 'Materiales' } });
  if (!materiales) {
    materiales = await prisma.storeCategory.create({
      data: { schoolId: school.id, name: 'Materiales', description: 'Utiles escolares y materiales didacticos', order: 3 }
    });
    console.log('Created category: Materiales');
  }

  const existingCount = await prisma.storeProduct.count({ where: { schoolId: school.id } });
  console.log('Existing products:', existingCount);

  const newProducts = [
    { schoolId: school.id, categoryId: uniformes.id, name: "Falda Escolar Azul", description: "Falda tableada azul marino", price: 380, stock: 40, sizes: ["4", "6", "8", "10", "12", "14"], colors: ["Azul Marino"], isRequired: true },
    { schoolId: school.id, categoryId: uniformes.id, name: "Short Deportivo", description: "Short deportivo con logo", price: 280, stock: 45, sizes: ["XS", "S", "M", "L", "XL"], colors: ["Azul Marino", "Blanco"], isRequired: true },
    { schoolId: school.id, categoryId: uniformes.id, name: "Playera Deportiva", description: "Playera dry-fit para educacion fisica", price: 320, stock: 55, sizes: ["XS", "S", "M", "L", "XL"], colors: ["Blanco", "Gris"], isRequired: true },
    { schoolId: school.id, categoryId: uniformes.id, name: "Chaleco Escolar", description: "Chaleco de lana con logo bordado", price: 520, stock: 30, sizes: ["XS", "S", "M", "L", "XL"], colors: ["Azul Marino"], isRequired: false },
    { schoolId: school.id, categoryId: libros.id, name: "Libro Ciencias Naturales 3", description: "Libro de texto oficial de Ciencias Naturales", price: 260, stock: 38, isRequired: true },
    { schoolId: school.id, categoryId: libros.id, name: "Libro Historia 3", description: "Libro de texto oficial de Historia de Mexico", price: 240, stock: 42, isRequired: true },
    { schoolId: school.id, categoryId: libros.id, name: "Libro Ingles - Level 3", description: "Libro de ingles con actividades interactivas", price: 450, stock: 35, isRequired: true },
    { schoolId: school.id, categoryId: materiales.id, name: "Calculadora Cientifica", description: "Calculadora Casio FX-82", price: 380, stock: 25, isRequired: false },
    { schoolId: school.id, categoryId: materiales.id, name: "Mochila Escolar Vermont", description: "Mochila ergonomica con logo", price: 750, stock: 20, colors: ["Azul Marino", "Negro"], isRequired: false },
    { schoolId: school.id, categoryId: materiales.id, name: "Lonchera Termica Vermont", description: "Lonchera con aislamiento termico", price: 320, stock: 35, colors: ["Azul", "Rosa", "Verde"], isRequired: false },
    { schoolId: school.id, categoryId: materiales.id, name: "Kit de Geometria", description: "Incluye regla, escuadras, compas y transportador", price: 150, stock: 50, isRequired: false },
    { schoolId: school.id, categoryId: materiales.id, name: "Botella de Agua Vermont", description: "Botella de acero inoxidable 500ml", price: 220, stock: 45, colors: ["Azul", "Plata", "Rosa"], isRequired: false },
  ];

  for (const product of newProducts) {
    const existing = await prisma.storeProduct.findFirst({ where: { schoolId: school.id, name: product.name } });
    if (!existing) {
      await prisma.storeProduct.create({ data: product });
      console.log('Created:', product.name);
    }
  }

  const finalCount = await prisma.storeProduct.count({ where: { schoolId: school.id } });
  console.log('Total products now:', finalCount);
}

addProducts().catch(console.error).finally(() => prisma.$disconnect());
