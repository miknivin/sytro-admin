import DefaultLayout from "@/components/Layouts/DefaultLayout";
import VendorTable from "@/components/Tables/VendorTable";

export default function page() {
  return (
    <>
      <DefaultLayout>
        <VendorTable />
      </DefaultLayout>
    </>
  );
}
