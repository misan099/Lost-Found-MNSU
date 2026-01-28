import Header from "./Header";

function LayoutNoFooter({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

export default LayoutNoFooter;
