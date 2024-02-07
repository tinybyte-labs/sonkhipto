import { API_URL } from "@/constants";
import Axios from "axios";

export const axios = Axios.create({ baseURL: API_URL });
