export const useBeautify = () => {
  const beautifyCard = (card: number) =>
    String(card).replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4");

  const beautifyPhone = (phone: number) =>
    String(phone).replace(
      /(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/,
      "($2) $3-$4-$5"
    );
  const getPayType = (type: number) => {
    const payTypes = {
      1: "CASH",
    } as any;
    return payTypes[type] || "CASH";
  };

  return {
    beautifyCard,
    getPayType,
    beautifyPhone,
  };
};