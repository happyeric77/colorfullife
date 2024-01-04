import axios, { AxiosRequestConfig } from "axios";
import {
  IDriveItem,
  IDriveItems,
  IDrives,
  IListItem,
  IListItemField,
  IListItems,
  ILists,
  ISites,
} from "./types";

type CallConfig = {
  endpoint: string;
  accessToken: string;
  method?: "get" | "post" | "patch" | "delete" | "put";
  params?: { [key: string]: string };
  data?: { [key: string]: any }; // TODO: type
  headers?: { [key: string]: string };
};
class GraphApiQuery {
  constructor(private accessToken: string) {}

  async getSites(siteName?: string): Promise<ISites> {
    let sites = (await this.callApi({
      endpoint: `v1.0/sites`,
      accessToken: this.accessToken,
      // params: siteName ? { search: siteName } : undefined,
    })) as ISites;
    if (siteName)
      sites = {
        ...sites,
        value: sites.value.filter((site) => site.name === siteName),
      };
    return sites;
  }
  async getListsInSite(siteId: string, listName?: string): Promise<ILists> {
    let lists = (await this.callApi({
      endpoint: `v1.0/sites/${siteId}/lists`,
      accessToken: this.accessToken,
    })) as ILists;
    if (listName)
      lists = {
        ...lists,
        value: lists.value.filter((list) => list.name === listName),
      };
    return lists;
  }
  async getItemsInList(siteId: string, listId: string): Promise<IListItems> {
    return (await this.callApi({
      endpoint: `v1.0/sites/${siteId}/lists/${listId}/items?expand=fields`, // OPTION: ?expand=fields(select=Column1,Column2) https://learn.microsoft.com/ja-jp/graph/api/listitem-list?view=graph-rest-1.0&tabs=http
      accessToken: this.accessToken,
    })) as IListItems;
  }
  async postCreateListItem(
    siteId: string,
    listId: string,
    fields: { [key: string]: string }
  ): Promise<IListItemField> {
    return (await this.callApi({
      endpoint: `v1.0/sites/${siteId}/lists/${listId}/items`,
      accessToken: this.accessToken,
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        fields: fields,
      },
    })) as IListItemField;
  }
  async patchUpdateListItem(
    siteId: string,
    listId: string,
    itemId: string,
    fields: { [key: string]: string }
  ): Promise<IListItem> {
    return (await this.callApi({
      endpoint: `v1.0/sites/${siteId}/lists/${listId}/items/${itemId}/fields`,
      accessToken: this.accessToken,
      method: "patch",
      headers: {
        "Content-Type": "application/json",
      },
      data: fields,
    })) as IListItem;
  }

  async deleteListItem(
    siteId: string,
    listId: string,
    itemId: string
  ): Promise<void> {
    return (await this.callApi({
      endpoint: `v1.0/sites/${siteId}/lists/${listId}/items/${itemId}`,
      accessToken: this.accessToken,
      method: "delete",
    })) as undefined; // RETURN HTTP/1.1 204 No Content
  }

  async getDrives(siteId: string, driveName?: string): Promise<IDrives> {
    let drives: IDrives = (await this.callApi({
      endpoint: `v1.0/sites/${siteId}/drives/`,
      accessToken: this.accessToken,
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    })) as IDrives;
    if (driveName)
      drives = {
        ...drives,
        value: drives.value.filter((site) => site.name === driveName),
      };
    return drives;
  }

  async getDriveItems(siteId: string, driveId: string): Promise<IDriveItems> {
    return (await this.callApi({
      endpoint: `v1.0/sites/${siteId}/drives/${driveId}/root/children`,
      accessToken: this.accessToken,
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    })) as IDriveItems;
  }

  async getDriveItemByFileName(
    siteId: string,
    driveId: string,
    itemName: string,
    loadContent?: boolean
  ): Promise<IDriveItem> {
    return (await this.callApi({
      endpoint: `v1.0/sites/${siteId}/drives/${driveId}/root:/${
        loadContent ? `${itemName}:/content` : itemName
      }`,
      accessToken: this.accessToken,
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    })) as IDriveItem;
  }

  async getDriveItemById(
    siteId: string,
    driveId: string,
    itemId: string,
    loadContent?: boolean
  ): Promise<IDriveItem> {
    return (await this.callApi({
      endpoint: `v1.0/sites/${siteId}/drives/${driveId}/items/${
        loadContent ? `${itemId}/content` : itemId
      }`,
      accessToken: this.accessToken,
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    })) as IDriveItem;
  }

  async putUploadDriveItem(
    siteId: string,
    driveId: string,
    fileName: string,
    data: any,
    folder?: string
  ): Promise<IDriveItem> {
    return (await this.callApi({
      endpoint: `v1.0/sites/${siteId}/drives/${driveId}/root:/${
        folder ? `${folder}` : ""
      }${fileName}:/content`,
      accessToken: this.accessToken,
      method: "put",
      data: data,
    })) as IDriveItem;
  }

  async deleteDriveItem(
    siteId: string,
    driveId: string,
    itemId: string
  ): Promise<IDriveItem> {
    return (await this.callApi({
      endpoint: `v1.0/sites/${siteId}/drives/${driveId}/items/${itemId}`,
      accessToken: this.accessToken,
      method: "delete",
    })) as IDriveItem;
  }

  private async callApi(
    configs: CallConfig,
    graphEndpoint?: string
  ): Promise<unknown> {
    graphEndpoint =
      graphEndpoint ?? "https://graph.microsoft.com/" + configs.endpoint;
    configs.method = configs.method ? configs.method : "get";
    const options: AxiosRequestConfig = {
      headers: {
        ...configs.headers,
        Authorization: `Bearer ${configs.accessToken}`,
      },
      params: configs.params,
    };

    switch (configs.method) {
      case "get":
        return (await axios.get(graphEndpoint, options)).data;
      case "post":
        return (await axios.post(graphEndpoint, configs.data, options)).data;
      case "patch":
        return (await axios.patch(graphEndpoint, configs.data, options)).data;
      case "put":
        return (await axios.put(graphEndpoint, configs.data, options)).data;
      case "delete":
        // This applies to both the Azure AD Graph and the Microsoft Graph. The only way to delete objects is using user delegated auth with a token from a user that has sufficient permissions to do so (generally an admin).
        return (await axios.delete(graphEndpoint, options)).data;
      default:
        throw Error(
          `ERROR: callApi - does not support this method - ${configs.method}`
        );
    }
  }
}

export { GraphApiQuery };
