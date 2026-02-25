import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import FirstStepForm from "./FirstStepForm";
import SecondStepForm from "./SecondStepForm";
import ThirdStepForm from "./ThirdStepForm";
import FourthStepForm from "./Fourthstepform";
import { getCurrentUser } from "../../api/user";

const FormContainer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const step = searchParams.get("step");
  const [step1Data, setStep1Data] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowForm, setAllowForm] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkOnboarding = async () => {
      try {
        const user = await getCurrentUser();
        if (!isMounted) return;

        if (user && user.hasCompletedOnboarding) {
          navigate("/");
        } else {
          setAllowForm(true);
        }
      } catch (error) {
        if (isMounted) {
          setAllowForm(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkOnboarding();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading || !allowForm) {
    return null;
  }

  switch (step) {
    case "1":
      return <FirstStepForm onStep1Complete={setStep1Data} />;
    case "2":
      return <SecondStepForm step1Data={step1Data} />;
    case "3":
      return <ThirdStepForm />;
    case "4":
      return <FourthStepForm />;
    default:
      return <FirstStepForm onStep1Complete={setStep1Data} />;
  }
};

export default FormContainer;
