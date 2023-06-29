import Modal from "react-modal";
import styles from "./styles.module.scss";
import { FiX } from "react-icons/fi";
import { useState, useEffect } from "react";
import { ItemProps, CategoryProps } from "../../pages/product";

import { setupApiClient } from "../../services/api";
import { Button } from "../ui/Button";

interface ModalOrderProps {
  isOpen: boolean;
  onSubmit: (productsInfo: ProductsInfo) => void;
  onRequestClose: () => void;
  categories: CategoryProps;
  editing: boolean;
  product: ProductsInfo;
  editIndex: number;
  client: string;
  // currentClient: string;
}

type ProductsInfo = {
  product: productsProps; // Adicionado novamente
  categoryIndex: number;
  productIndex: number;
  quantity: number;
  details: Detail[];
  client: string;
};

type Detail = {
  id: number;
  value: string;
};

type productsProps = {
  name: string;
  description: string;
  price: string;
  available: boolean;
  banner: string;
  id: string;
  categoryId: string;
};

export function ModalCreateOrder({
  isOpen,
  onSubmit,
  onRequestClose,
  categories,
  editing,
  product,
  editIndex,
  client,
}: // currentClient
ModalOrderProps) {
  const [productList, setProductsList] = useState([]);
  const [productSelected, setProductSelected] = useState(0);

  const [categorySelected, setCategorySelected] = useState(0);

  const [quantity, setQuantity] = useState(1);
  const [details, setDetails] = useState([]);

  const [loading, setLoading] = useState(false);

  const [test, setTest] = useState("");

  useEffect(() => {
    setTest(client);

    if (categorySelected !== null) {
      fetchProductsByCategory(categories.categoryList[categorySelected].id);
      refreshDetailList(quantity);

      if (editing === true && product !== null) {
        // setTest(currentClient);

        fetchProductsByCategory(product.product.categoryId);

        setCategorySelected(product.categoryIndex);
        setProductSelected(product.productIndex);
        setQuantity(product.quantity);
        setDetails(product.details);
      }
    }
  }, []); // Array de dependências vazio para executar apenas uma vez

  const fetchProductsByCategory = async (categoryId: string) => {
    setLoading(true);
    const apiClient = setupApiClient();

    try {
      const response = await apiClient.get("/category/product", {
        params: {
          categoryId: categoryId,
        },
      });

      setProductsList(response.data);
    } catch (error) {
      console.log("Erro ao buscar produtos por categoria ", error);
    }
    setLoading(false);
  };

  function refreshDetailList(quantity, inputValue?) {
    const newQuantity = Number(quantity);

    if (editing === true && product !== null) {
      const updatedDetails = [...details];

      // Adicionar detalhes adicionais, se necessário
      if (newQuantity > updatedDetails.length) {
        const additionalDetails = Array.from(
          { length: newQuantity - updatedDetails.length },
          (_, index) => ({
            id: updatedDetails.length + index,
            value: "",
          })
        );
        updatedDetails.push(...additionalDetails);
      }

      // Atualizar a quantidade de detalhes
      if (newQuantity < updatedDetails.length) {
        updatedDetails.splice(newQuantity, updatedDetails.length - newQuantity);
      }

      setDetails(updatedDetails);
    } else {
      const newDetails = Array.from({ length: newQuantity }, (_, index) => ({
        id: index,
        value: inputValue || "",
      }));
      setDetails(newDetails);
    }
  }

  function handleChangeCategory(event) {
    setCategorySelected(event.target.value);
    fetchProductsByCategory(categories.categoryList[event.target.value].id);
  }

  function handleChangeProduct(event) {
    setProductSelected(event.target.value);
  }

  const handleQuantityChange = (event) => {
    const newQuantity = Number(event.target.value);
    setQuantity(newQuantity);
    refreshDetailList(newQuantity);
  };

  const handleDetailChange = (event, index) => {
    const newDetails = [...details];
    newDetails[index].value = event.target.value;
    setDetails(newDetails);
  };

  const customStyles = {
    content: {
      top: "50%",
      bottom: "auto",
      left: "50%",
      right: "auto",
      padding: "30px",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#1d1d2e",
    },
  };

  function handleFormSubmit(event) {
    event.preventDefault();
    const product = productList[productSelected];

    if (editing === true && editIndex !== null) {
      // Se estiver editando e o editIndex existir, substitua o item no array productsList
      setProductsList((prevList) => {
        const newList = [...prevList];
        newList[editIndex] = productsInfo;
        return newList;
      });
    }

    const productsInfo: ProductsInfo = {
      productIndex: productSelected,
      categoryIndex: categorySelected,
      product,
      quantity,
      details,
      client: test,
    };

    onSubmit(productsInfo);

    onRequestClose();
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Criar Pedido</h2>
          <button
            type="button"
            onClick={onRequestClose}
            className="react-modal-close"
            style={{ background: "transparent", border: 0 }}
          >
            <FiX size={45} color="#f34748" />
          </button>
        </div>

        <div className={styles.mainContainer}>
          <form className={styles.form} onSubmit={handleFormSubmit}>
            <select
              value={categorySelected}
              onChange={(event) => handleChangeCategory(event)}
            >
              {categories.categoryList.map((item, index) => {
                return (
                  <option key={item.id} value={index}>
                    {item.categoryName}
                  </option>
                );
              })}
            </select>

            <select value={productSelected} onChange={handleChangeProduct}>
              {productList.length === 0 ? (
                <option>Nenhum produto!</option>
              ) : (
                productList.map((item, index) => (
                  <option key={item.id} value={index}>
                    {item.name}
                  </option>
                ))
              )}
            </select>
            <input
              type="number"
              placeholder="Quantidade"
              value={quantity}
              onChange={(event) => handleQuantityChange(event)}
            />

            {details.map((detail, index) => (
              <input
                key={detail.id}
                type="text"
                placeholder={"Detalhe do produto " + (index + 1)}
                value={detail.value || ""}
                onChange={(event) => handleDetailChange(event, index)}
              ></input>
            ))}
            <Button type="submit" loading={loading}>
              {editing ? "Salvar" : "Adicionar"}
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
