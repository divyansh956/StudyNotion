import axios from "axios";

export const axiosInstance = axios.create({});

export const apiConnector = async (method, url, bodyData, headers, params) => {
    try {
        const response = await axiosInstance({
            method: `${method}`,
            url: `${url}`,
            data: bodyData ? bodyData : null,
            headers: headers ? headers : null,
            params: params ? params : null,
        });

        console.log(`Request to ${method} ${url} successful. Response:`, response.data);
        return response;
    } catch (error) {
        console.error(`Error in request to ${method} ${url}:`, error);
        throw error;
    }
};
