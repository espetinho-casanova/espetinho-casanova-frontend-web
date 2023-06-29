import Modal from "react-modal";
import styles from "./styles.module.scss";
import { FiX } from "react-icons/fi";
import { OrderItemProps } from "../../pages/dashboard";
import { productItemDetailProps } from "../../pages/dashboard";

interface ModalOrderProps {
  isOpen: boolean;
  onRequestClose: () => void;
  order: OrderItemProps;
  handleFinishOrder: (id: string) => void;
}

export function ModalOrder({
  isOpen,
  onRequestClose,
  order,
  handleFinishOrder,
}: ModalOrderProps) {
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

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      <button
        type="button"
        onClick={onRequestClose}
        className="react-modal-close"
        style={{ background: "transparent", border: 0 }}
      >
        <FiX size={45} color="#f34748" />
      </button>

      <div className={styles.container}>
        <h2>Detalhes do pedido</h2>

        <span className={styles.table}>
          <strong>
            {"| "}
            {["Mesa: " + order.order.table, order.order.name]
              .filter(Boolean)
              .join(" | ")}
            {" |"}
          </strong>
        </span>

        {order.orderItems.map((item) => {
          let counter = 1; // Inicia o contador em 1

          return (
            <section key={item.id} className={styles.containerItem}>
              <span>
                {item.amount} - <strong>{item.product.name}</strong>
              </span>

              {item.product.orderItemDetails.map(
                (itemDetail: productItemDetailProps) => {
                  const detailNumber = counter++;

                  return (
                    <span key={itemDetail.id} className={styles.itemDetail}>
                      {"  *"} {detailNumber} {" - "} {itemDetail.observacao}{" "}
                      <br />
                    </span>
                  );
                }
              )}
            </section>
          );
        })}

        <button
          className={styles.buttonOrder}
          onClick={() => handleFinishOrder(order.order.id)}
        >
          Concluir Pedido
        </button>
      </div>
    </Modal>
  );
}
