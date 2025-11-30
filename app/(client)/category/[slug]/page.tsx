import Container from "@/components/Container";
import CategoryProducts from "@/components/new/CategoryProducts";
import Title from "@/components/Title";


import React from "react";

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  return (
    <div>
      <Container className="py-10">
        <Title className="text-xl">
          Products by Category:{" "}
          <span className="font-bold text-green-600 capitalize tracking-wide">
            {slug && slug}
          </span>
        </Title>

        <CategoryProducts />
      </Container>
    </div>
  );
};

export default CategoryPage;