import ProductCard from "../ProductCard";
import vinylImage from "@assets/generated_images/Vinyl_banner_product_photo_7f6d1908.png";

export default function ProductCardExample() {
  return (
    <div className="max-w-sm">
      <ProductCard
        id={1}
        name="Banner Vinílico Premium"
        description="Banner de alta qualidade, ideal para ambientes internos e externos"
        pricePerM2={45.90}
        image={vinylImage}
        onAddToCart={(id, w, h, total) => console.log("Added:", { id, w, h, total })}
      />
    </div>
  );
}
