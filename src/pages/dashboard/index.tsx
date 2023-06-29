import { useState } from "react";
import { canSSRAuth } from "../../utils/canSSRAuth";
import Head from "next/head";
import styles from "./styles.module.scss";

import { Header } from "../../components/Header";
import { FiRefreshCcw, FiPlus } from "react-icons/fi";

import { setupApiClient } from "../../services/api";

import { ModalOrder } from "../../components/ModalOrder";

import Link from "next/link";

import Modal from "react-modal";

export type OrderItem = {
  id: string;
  table: string | number;
  status: string;
  draft: boolean;
  name: string | null;
  userId?: string;
};

export interface OrdersProps {
  orders: OrderItem[];
}

export type productItemDetailProps = {
  id: string;
  observacao: string;
  itemId: string;
};

export type ItemProps = {
  id: string;
  amount: string | number;
  orderId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: string | number;
    description: string;
    banner: string;
    available: boolean;
    categoryId: string;
    orderItemDetails: productItemDetailProps[] | [];
  };
};

export type OrderItemProps = {
  order: {
    id: string;
    table: string | number;
    status: string;
    draft: boolean;
    name: string | null;
    userId?: string;
  };
  orderItems: ItemProps[];
};

export default function Dashboard({ orders }: OrdersProps) {
  const [orderList, setOrderList] = useState(orders || []);

  const [modalItem, setModalItem] = useState<OrderItemProps>();
  const [modalVisible, setModalVisible] = useState(false);

  function handleCloseModal() {
    setModalVisible(false);
  }

  async function handleOpenModalView(id: string) {
    const apiClient = setupApiClient();

    const response = await apiClient.get("/order/detail", {
      params: {
        orderId: id,
      },
    });
    setModalItem(response.data);
    setModalVisible(true);
  }

  async function handleFinishItem(id: string) {
    const apiClient = setupApiClient();
    await apiClient.put("/order/finish", {
      orderId: id,
    });

    const response = await apiClient.get("/orders");
    setOrderList(response.data);

    setModalVisible(false);
  }

  async function handleRefreshOrder() {
    const apiClient = setupApiClient();

    const response = await apiClient.get("orders");
    setOrderList(response.data);
  }

  Modal.setAppElement("#__next");

  return (
    <>
      <Head>
        <title>Painel - Espetinho Casanova</title>
      </Head>
      <div>
        <Header />

        <main className={styles.container}>
          <div className={styles.containerHeader}>
            <div>
              <h1>Últimos pedidos</h1>
              <button
                className={styles.customButton}
                onClick={handleRefreshOrder}
              >
                <FiRefreshCcw size={25} color="#3fffa3" />
              </button>
            </div>
            <div className={styles.customLink}>
              <Link legacyBehavior href="/order">
                <a>
                  <FiPlus size={35} color="#3fffa3" />
                </a>
              </Link>
            </div>
          </div>

          {orderList.length === 0 && (
            <span className={styles.emptyList}>Nenhum pedido no momento!</span>
          )}

          <article className={styles.listOrders}>
            {orderList.map((item) => (
              <section key={item.id} className={styles.orderItem}>
                <button onClick={() => handleOpenModalView(item.id)}>
                  <div className={styles.tag}></div>
                  <span>Mesa {item.table}</span>
                </button>
              </section>
            ))}
          </article>
        </main>

        {modalVisible && (
          <ModalOrder
            isOpen={modalVisible}
            onRequestClose={handleCloseModal}
            order={modalItem}
            handleFinishOrder={handleFinishItem}
          />
        )}
      </div>
    </>
  );
}

export const getServerSideProps = canSSRAuth(async (context) => {
  const apiClient = setupApiClient(context);

  const response = await apiClient.get("/orders");

  return {
    props: {
      orders: response.data,
    },
  };
});
