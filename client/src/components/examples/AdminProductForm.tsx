import AdminProductForm from "../AdminProductForm";

export default function AdminProductFormExample() {
  return (
    <div className="max-w-2xl p-6">
      <AdminProductForm
        onSave={(data) => console.log("Save:", data)}
        onCancel={() => console.log("Cancel")}
      />
    </div>
  );
}
