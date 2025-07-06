import { SignInRequest, SignUpRequest } from "@/types/auth";
import axios from "axios";



export default async function Signup(data: SignUpRequest) {
  console.log("Data to be sent:", data);
  const response = await axios.post("http://localhost:5000/auth/signup", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(response.data);
  return response.data;
}

export async function Signin(data: SignInRequest) {
  console.log("Data to be sent:", data);
  const response = await axios.post("http://localhost:5000/auth/login", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
}