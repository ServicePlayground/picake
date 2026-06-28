import React from "react";
import { useParams } from "react-router-dom";
import { ProductCreationForm } from "@/apps/web-seller/features/product/components/forms/ProductCreationForm";
import type { CreateProductRequestDto } from "@/apps/web-seller/features/product/types/product.dto";
import type { ProductForm } from "@/apps/web-seller/features/product/types/product.ui";
import { useCreateProduct } from "@/apps/web-seller/features/product/hooks/mutations/useProductMutation";
import { Card, CardContent } from "@/apps/web-seller/common/components/cards/Card";

export const StoreDetailProductCreatePage: React.FC = () => {
  const { storeId } = useParams();
  const createProductMutation = useCreateProduct();

  if (!storeId) {
    return (
      <div>
        <h2 className="text-xl font-semibold">스토어가 선택되지 않았습니다.</h2>
      </div>
    );
  }

  const handleSubmit = async (data: ProductForm) => {
    const request: CreateProductRequestDto = {
      ...data,
      storeId,
      originalPrice: data.originalPrice!,
      salePrice: data.salePrice!,
      letteringMaxLength: data.letteringMaxLength ?? 1,
    };

    await createProductMutation.mutateAsync(request);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">상품 등록</h1>
      <Card>
        <CardContent className="p-6">
          <ProductCreationForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
};
