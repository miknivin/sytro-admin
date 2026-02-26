import DefaultLayout from "@/components/Layouts/DefaultLayout";
import VendorDetails from "@/components/VendorDetails";

interface VendorPageProps {
  params: {
    id: string;
  };
}

const VendorPage: React.FC<VendorPageProps> = ({ params }) => {
  return (
    <DefaultLayout>
      <VendorDetails vendorId={params.id} />
    </DefaultLayout>
  );
};

export default VendorPage;
