import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHead } from "@/components/site/Hero";
import { rupiah } from "@/lib/format";
import { todayJakarta } from "@/lib/order";
import { CATEGORY_INFO, CATEGORY_ORDER } from "@/lib/packages";
import { getPackages } from "@/lib/queries";
import { OrderForm } from "./OrderForm";

export const metadata: Metadata = {
  title: "Formulir Pemesanan Aqiqah",
  description: "Isi formulir pemesanan aqiqah Utsmani Aqiqah, admin kami akan segera menghubungi Anda.",
};

async function OrderFormLoader({ searchParams }: { searchParams: PageProps<"/pesan">["searchParams"] }) {
  const [packages, params] = await Promise.all([getPackages(), searchParams]);
  const options = CATEGORY_ORDER.flatMap((category) =>
    packages
      .filter((p) => p.category === category)
      .map((p) => {
        const hasAnimal = p.priceBetina != null || p.priceJantan != null;
        const price = hasAnimal ? `mulai ${rupiah(Math.min(...[p.priceBetina, p.priceJantan].filter((x): x is number => x != null)))}` : `${rupiah(p.price)}/box`;
        return { id: p.id, label: `${p.name} — ${price}`, group: CATEGORY_INFO[category].label, hasAnimal };
      }),
  );
  const initial = Number(params.paket);
  return <OrderForm packages={options} initialPackageId={Number.isInteger(initial) ? initial : undefined} minDate={todayJakarta()} />;
}

export default function PesanPage(props: PageProps<"/pesan">) {
  return (
    <>
      <PageHead
        tag="Pemesanan"
        title="Formulir Pemesanan Aqiqah"
        description="Isi data berikut, lalu kirimkan ringkasan pesanan ke WhatsApp admin kami untuk konfirmasi."
      />
      <section className="section bg-fade" style={{ paddingTop: 60 }}>
        <div className="container">
          <Suspense fallback={<div className="form-card empty">Memuat formulir…</div>}>
            <OrderFormLoader searchParams={props.searchParams} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
