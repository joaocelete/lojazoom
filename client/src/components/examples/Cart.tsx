import Cart from "../Cart";
import vinylImage from "@assets/generated_images/Vinyl_banner_product_photo_7f6d1908.png";
import stickerImage from "@assets/generated_images/Adhesive_vinyl_sticker_product_9ad4721d.png";

export default function CartExample() {
  const mockItems = [
    {
      id: 1,
      name: "Banner Vinílico Premium",
      image: vinylImage,
      width: 2.5,
      height: 1.5,
      pricePerM2: 45.90,
      total: 172.13
    },
    {
      id: 2,
      name: "Adesivo Vinílico",
      image: stickerImage,
      width: 1.0,
      height: 0.5,
      pricePerM2: 35.00,
      total: 17.50
    }
  ];

  return (
    <Cart
      items={mockItems}
      isOpen={true}
      onClose={() => console.log("Close cart")}
      onRemoveItem={(id) => console.log("Remove item:", id)}
      onCheckout={() => console.log("Checkout")}
    />
  );
}
