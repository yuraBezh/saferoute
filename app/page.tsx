import { prisma } from '@/lib/prisma';

export default async function Home() {
  const children = await prisma.child.findMany();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        Children
      </h1>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
          <tr>
            <th className="px-6 py-4 font-semibold">First name</th>
            <th className="px-6 py-4 font-semibold">Last name</th>
            <th className="px-6 py-4 font-semibold">Date of Birth</th>
          </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
          {children.map((child) => (
            <tr
              key={child.id}
              className="text-gray-700 transition-colors hover:bg-gray-50"
            >
              <td className="px-6 py-4">{child.firstName}</td>
              <td className="px-6 py-4">{child.lastName}</td>
              <td className="px-6 py-4">
                {child.birthDate.toLocaleDateString()}
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
