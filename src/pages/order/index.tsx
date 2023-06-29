import { useState } from "react";
import Head from "next/head";
import styles from "./styles.module.scss";
import { Header } from "../../components/Header";
import { canSSRAuth } from "../../utils/canSSRAuth";

import { FiPlus } from "react-icons/fi";
import { CategoryProps } from "../product";

import { setupApiClient } from "../../services/api";

import { OrderItemProps, OrderItem } from "../dashboard";

import { ModalCreateOrder } from "../../components/ModalCreateOrder";

import Modal from "react-modal";
import { toast } from "react-toastify";
import Router from "next/router";
import { Button } from "../../components/ui/Button";

export default function Order({ categoryList }: CategoryProps) {
  const [categories, setCategories] = useState({
    categoryList: categoryList || [],
  });

  const [orderList, setOrderList] = useState([]);

  const [number, setNumber] = useState("");
  const [name, setName] = useState("");

  const [productsInfoList, setProductsInfoList] = useState([]);
  const [product, setProduct] = useState();
  const [editIndex, setEditIndex] = useState(null);
  const [editingProduct, setEditingProduct] = useState(false);
  const [editedProduct, setEditedProduct] = useState({});

  const [modalVisible, setModalVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  const [client, setClient] = useState("");

  function handleCloseModal() {
    setModalVisible(false);
    setEditingProduct(null);
  }

  function handleOpenModalView(categoryList: CategoryProps) {
    setModalVisible(true);
    console.log(categories);
  }

  function handleOpenModalEditing(
    event,
    categoryIndex: number,
    productIndex: number,
    index: number
  ) {
    event.preventDefault();
    setProduct(productsInfoList[index]);
    setEditedProduct(productsInfoList[index]); // Passa o produto sendo editado para editedProduct
    setModalVisible(true);
    setEditingProduct(true);
    setEditIndex(index);
  }

  function handleaddProductToList(newOrderItem) {
    const productsInfo = { ...newOrderItem, index: editIndex }; // Adiciona o índice do item sendo editado

    if (editingProduct === true && editIndex !== null) {
      setProductsInfoList((prevOrderItems) => {
        const updatedOrderItems = [...prevOrderItems];
        updatedOrderItems[editIndex] = productsInfo; // Substitui o item na posição editIndex pelo novo item atualizado
        return updatedOrderItems;
      });
      setEditIndex(null);
      setEditingProduct(false);
    } else {
      setProductsInfoList((prevOrderItems) => {
        const updatedOrderItems = [...prevOrderItems, productsInfo];
        return groupOrdersByClient(updatedOrderItems);
      });
    }
  }

  function groupOrdersByClient(orderItems) {
    const groupedOrders = orderItems.reduce((acc, order) => {
      const client = order.client;
      if (!acc[client]) {
        acc[client] = [order];
      } else {
        acc[client].push(order);
      }
      return acc;
    }, {});
    return Object.values(groupedOrders).flat();
  }

  function handleDeleteProduct(index) {
    const updatedProductsList = [...productsInfoList];
    updatedProductsList.splice(index, 1);
    setProductsInfoList(updatedProductsList);
  }

  const fetchOrders = async () => {
    const apiClient = setupApiClient();
    try {
      const response = await apiClient.get("/orders");
      return response.data; // Retorna a lista de pedidos
    } catch (error) {
      console.log("Erro ao buscar produtos por categoria ", error);
      return []; // Retorna uma lista vazia em caso de erro
    }
  };

  async function handleFormSubmit(event) {
    event.preventDefault();

    if (!(number === "" || number === null)) {
      const orders = await fetchOrders();
      if (orders.length > 0) {
        if (productsInfoList.length === 0) {
          toast.warn("Adicione produtos ao pedido!");
          return; // Interrompe a execução da função caso não exista produtos da lista
        }
      }

      // -- Caso as verificações passarem cadastrar o pedido no banco
      setLoading(true);
      const apiClient = setupApiClient();

      const responseOrder = await apiClient.post("/order", {
        table: Number(number),
        name: name == "" ? "" : name,
        status: 1,
        draft: false,
      });

      const orderId = responseOrder.data.id;

      // -- buscar os produtos deste pedido
      productsInfoList.forEach(async (product) => {
        let client = product.client;
        console.log("test", product.client);

        // -- Cadastrar cada produto no pedido
        let responseProducs = await apiClient.post("/order/add", {
          amount: product.quantity,
          orderId: orderId,
          productId: product.product.id,
          client: client,
        });
        console.log("resposta produ ", responseProducs);

        let orderItemId = responseProducs.data.id;

        // -- se houver details cadastrar os detalhes
        product.details.forEach(async (detail) => {
          let responseDetails = await apiClient.post("/order/addItemDetail", {
            observacao: detail.value,
            orderItemId: orderItemId,
          });

          console.log("resposta detalhes ", responseDetails);
        });
      });

      //-- Se o pedido foi cadastrado com sucesso, exibir uma notificação e retornar para a página dashboard

      toast.success("Pedido cadastrado com sucesso!");
      Router.push("/dashboard");
    } else {
      toast.warn("Digite um número para a mesa!"); // caso não houver número na mesa, exibir notificação para adicionar
    }

    setLoading(false);
  }

  const productsByClient = {};

  productsInfoList.forEach((product, index) => {
    const clientName = product.client;

    if (!productsByClient[clientName]) {
      productsByClient[clientName] = [];
    }

    const productWithIndex = {
      ...product,
      index: index,
    };

    productsByClient[clientName].push(productWithIndex);
  });

  Modal.setAppElement("#__next");

  return (
    <>
      <Head>
        <title>Novo Pedido - Espetinho Casanova </title>
      </Head>

      <div>
        <Header />
        <main className={styles.container}>
          <div className={styles.containerHeader}>
            <div>
              <h1>Novo pedido!</h1>
            </div>
            <div>
              <button
                className={styles.customLink}
                onClick={() => handleOpenModalView({ categoryList })}
              >
                <FiPlus
                  size={35}
                  color="#3fffa3"
                  style={{ backgroundColor: "transparent" }}
                />
              </button>
            </div>
          </div>
          <form className={styles.form}>
            <div>
              <div>
                <input
                  type="number"
                  placeholder="Digite o numero da mesa"
                  className={styles.input}
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="ou de um nome para a mesa..."
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="identificação do cliente"
                  className={styles.input}
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                />
              </div>
            </div>

            {Object.keys(productsByClient).length > 0 ? (
              <div>
                {Object.keys(productsByClient).map((clientName) => (
                  <div key={clientName}>
                    <h2>{clientName}</h2>
                    <div className={styles.productList}>
                      {productsByClient[clientName].map((product) => {
                        // const index = product.index; // Atribuir product.index a uma variável chamada index
                        // const categoryIndex = product.categoryIndex; // Atribuir product.index a uma variável chamada index
                        // const productIndex = product.productIndex; // Atribuir product.index a uma variável chamada index

                        return (
                          <div
                            key={product.index}
                            className={styles.productItem}
                          >
                            <span className={styles.quantity}>
                              {product.quantity}
                            </span>
                            <span className={styles.name}>
                              {product.product.name ? product.product.name : ""}
                            </span>
                            <button
                              className={styles.editButton}
                              onClick={(event) =>
                                handleOpenModalEditing(
                                  event,
                                  product.categoryIndex,
                                  product.productIndex,
                                  product.index
                                )
                              }
                            >
                              Editar
                            </button>
                            <button
                              className={styles.deleteButton}
                              onClick={() => handleDeleteProduct(product.index)}
                            >
                              Excluir
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.productList}>
                <div className={styles.productItem}>
                  <span>Adicione um produto...</span>
                </div>
              </div>
            )}

            <div className={styles.buttonAdd}>
              <Button loading={loading} onClick={handleFormSubmit}>
                Abrir mesa!
              </Button>
            </div>
          </form>
        </main>

        {modalVisible && (
          <ModalCreateOrder
            isOpen={modalVisible}
            onRequestClose={handleCloseModal}
            categories={categories}
            editing={editingProduct}
            product={product}
            onSubmit={handleaddProductToList}
            editIndex={editIndex}
            client={client}
          />
        )}
      </div>
    </>
  );
}

export const getServerSideProps = canSSRAuth(async (context) => {
  const apiClient = setupApiClient(context);

  const response = await apiClient.get("/categories");

  return {
    props: {
      categoryList: response.data,
    },
  };
});
