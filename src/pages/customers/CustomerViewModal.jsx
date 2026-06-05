import { useCustomers } from "../../context/CustomerContext";

export default function CustomerViewModal() {
  const { selectedCustomer, setSelectedCustomer } = useCustomers();

  if (!selectedCustomer) return null;

  const c = selectedCustomer;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] p-6 rounded-xl shadow-lg">
        
        <h2 className="text-xl font-bold mb-4">
          Customer Details
        </h2>

        <div className="space-y-2 text-sm">
          <p><b>Name:</b> {c.firstName} {c.lastName}</p>
          <p><b>Email:</b> {c.email}</p>
          <p><b>Phone:</b> {c.phone}</p>
          <p><b>Loyalty Points:</b> {c.loyaltyPoints}</p>
          <p><b>Total Purchases:</b> {c.totalPurchases}</p>
          <p><b>Preferred Branch:</b> {c.preferredBranch?.name}</p>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={() => setSelectedCustomer(null)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}