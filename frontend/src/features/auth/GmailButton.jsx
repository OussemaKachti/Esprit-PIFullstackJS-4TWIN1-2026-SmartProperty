import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "../../styles/gmailbutton.css";

const GmailButton = () => {
  const handleSuccess = (credentialResponse) => {
    const user = jwtDecode(credentialResponse.credential);
    console.log("Google user:", user);
  };

  return (
    <div className="gmail-button">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          console.log("Google Login Failed");
        }}
        theme="outline"
        size="large"
        shape="rectangular"
        text="signin_with"
        width="100%"
      />
    </div>
  );
};

export default GmailButton;