import AdminSidebar from "../AdminSidebar";

export default function AdminSidebarExample() {
  return (
    <AdminSidebar
      currentPage="products"
      onNavigate={(page) => console.log("Navigate to:", page)}
      onLogout={() => console.log("Logout")}
    />
  );
}
