// application/src/app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Locker from "@/models/Locker.model";
import Rental from "@/models/Rental.model";
import { withAuth } from "@/lib/auth/withAuth";

const getStatsHandler = async () => {
  try {
    await connectDB();

    // Executa todas as contagens em paralelo para máxima eficiência
    const [totalLockers, availableLockers, occupiedLockers, overdueRentals] =
      await Promise.all([
        Locker.countDocuments(),
        Locker.countDocuments({ status: "available" }),
        Locker.countDocuments({ status: "occupied" }),
        Rental.countDocuments({
          isActive: true,
          "datas.prevista": { $lt: new Date() },
        }),
      ]);

    return NextResponse.json({
      total: totalLockers,
      available: availableLockers,
      occupied: occupiedLockers,
      overdue: overdueRentals,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas do dashboard:", error);
    return NextResponse.json(
      { message: "Erro ao buscar estatísticas." },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getStatsHandler);
