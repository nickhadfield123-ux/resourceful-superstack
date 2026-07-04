import { Configuration, FrontendApi } from "@ory/client";

const config = new Configuration({
  basePath: process.env.NEXT_PUBLIC_ORY_SDK_URL || 'http://localhost:4433',
  baseOptions: {
    withCredentials: true,
  },
});

export const ory = new FrontendApi(config);
