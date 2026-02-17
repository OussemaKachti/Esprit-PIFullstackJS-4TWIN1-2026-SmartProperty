import { useSearchParams } from "react-router-dom";
import FirstStepForm from "./FirstStepForm";
import SecondStepForm from "./SecondStepForm";
import ThirdStepForm from "./ThirdStepForm";

const FormContainer = () => {
  const [searchParams] = useSearchParams();
  const step = searchParams.get("step");

  switch (step) {
    case "1":
      return <FirstStepForm />;
    case "2":
      return <SecondStepForm />;
    case "3":
      return <ThirdStepForm />;
    default:
      return <FirstStepForm />; 
  }
};

export default FormContainer;
