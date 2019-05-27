export interface IConfigOptions {
  serve: {
    port: number
  };
  ssr: {
    template: string;
    server: string;
    client: string;
  }
}
