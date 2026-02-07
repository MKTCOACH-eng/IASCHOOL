import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addMoreProducts() {
  const school = await prisma.school.findFirst();
  if (!school) return;

  const uniformes = await prisma.storeCategory.findFirst({ where: { schoolId: school.id, name: 'Uniformes' } });
  const libros = await prisma.storeCategory.findFirst({ where: { schoolId: school.id, name: 'Libros' } });
  const materiales = await prisma.storeCategory.findFirst({ where: { schoolId: school.id, name: 'Materiales' } });
  if (!uniformes || !libros || !materiales) return;

  const moreProducts = [
    { schoolId: school.id, categoryId: uniformes.id, name: "Playera Polo Blanca", description: "Playera polo de algodon con logo bordado", price: 350, stock: 50, sizes: ["XS", "S", "M", "L", "XL"], colors: ["Blanco"], isRequired: true },
    { schoolId: school.id, categoryId: uniformes.id, name: "Pantalon Escolar Azul", description: "Pantalon de vestir azul marino, tela gabardina", price: 450, stock: 30, sizes: ["4", "6", "8", "10", "12", "14", "16"], colors: ["Azul Marino"], isRequired: true },
    { schoolId: school.id, categoryId: uniformes.id, name: "Sudadera Deportiva", description: "Sudadera con cierre y capucha, logo bordado", price: 650, stock: 25, sizes: ["S", "M", "L", "XL"], colors: ["Azul Marino", "Gris"], isRequired: false },
    { schoolId: school.id, categoryId: uniformes.id, name: "Tenis Deportivos Blancos", description: "Tenis blancos autorizados para educacion fisica", price: 890, stock: 20, sizes: ["21", "22", "23", "24", "25", "26"], colors: ["Blanco"], isRequired: true },
    { schoolId: school.id, categoryId: libros.id, name: "Libro Matematicas 3", description: "Libro de texto oficial de Matematicas", price: 280, stock: 40, isRequired: true },
    { schoolId: school.id, categoryId: libros.id, name: "Libro Espanol 3", description: "Libro de texto oficial de Espanol", price: 250, stock: 35, isRequired: true },
    { schoolId: school.id, categoryId: libros.id, name: "Atlas de Mexico", description: "Atlas geografico con mapas actualizados", price: 180, stock: 30, isRequired: false },
    { schoolId: school.id, categoryId: libros.id, name: "Diccionario Escolar", description: "Diccionario de la lengua espanola para primaria", price: 120, stock: 45, isRequired: false },
    { schoolId: school.id, categoryId: materiales.id, name: "Paquete de Utiles Basicos", description: "Incluye: 5 cuadernos, lapices, colores, pegamento y tijeras", price: 320, stock: 60, isRequired: false },
    { schoolId: school.id, categoryId: materiales.id, name: "Colores Profesionales 36 pzas", description: "Caja de colores de madera de alta calidad", price: 280, stock: 40, isRequired: false },
    { schoolId: school.id, categoryId: materiales.id, name: "Estuche de Lapices Vermont", description: "Estuche con cierre y compartimentos", price: 150, stock: 55, colors: ["Azul", "Rosa", "Negro"], isRequired: false },
    { schoolId: school.id, categoryId: materiales.id, name: "Agenda Escolar 2026-2027", description: "Agenda con calendario escolar y notas", price: 180, stock: 70, isRequired: false },
  ];

  for (const product of moreProducts) {
    const existing = await prisma.storeProduct.findFirst({ where: { schoolId: school.id, name: product.name } });
    if (!existing) {
      await prisma.storeProduct.create({ data: product });
      console.log('Created:', product.name);
    }
  }

  const finalCount = await prisma.storeProduct.count({ where: { schoolId: school.id } });
  console.log('Total products:', finalCount);
}

addMoreProducts().catch(console.error).finally(() => prisma.$disconnect());
