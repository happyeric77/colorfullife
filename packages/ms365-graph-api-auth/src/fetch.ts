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

import { getRequestHandler } from "../utils/requestHandler";

class GraphApiQuery {
  constructor(private accessToken: string) {}

  private baseApiUrl = "https://graph.microsoft.com/";

  private get baseParams() {
    return {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    };
  }

  async getSites(siteName?: string): Promise<ISites> {
    const getSharePointSites = getRequestHandler<ISites>((params) =>
      axios.get(this.baseApiUrl + "v1.0/sites", params)
    );
    const res = await getSharePointSites(this.baseParams);

    if (!res.success) throw Error("ERROR: getSites - " + res.error.message);
    let sites = res.data;
    if (siteName)
      sites = {
        ...sites,
        value: sites.value.filter((site) => site.name === siteName),
      };
    return sites;
  }

  async getListsInSite(siteId: string, listName?: string): Promise<ILists> {
    const getListsInSite = getRequestHandler<ILists>((params) =>
      axios.get(this.baseApiUrl + `v1.0/sites/${siteId}/lists`, params)
    );

    const res = await getListsInSite(this.baseParams);

    if (!res.success)
      throw Error("ERROR: getListsInSite - " + res.error.message);
    let lists = res.data;
    if (listName)
      lists = {
        ...lists,
        value: lists.value.filter((list) => list.name === listName),
      };
    return lists;
  }

  async getItemsInList(siteId: string, listId: string): Promise<IListItems> {
    const getItemsInList = getRequestHandler<IListItems>((params) =>
      axios.get(
        this.baseApiUrl +
          `v1.0/sites/${siteId}/lists/${listId}/items?expand=fields`,
        params
      )
    );
    const res = await getItemsInList(this.baseParams);
    if (!res.success)
      throw Error("ERROR: getItemsInList - " + res.error.message);

    return res.data;
  }

  // TODO: Broken - https://stackoverflow.com/questions/50851894/how-to-create-sharepoint-list-item-with-microsoft-graph-api
  async postCreateListItem(
    siteId: string,
    listId: string,
    fields: { [key: string]: any }
  ): Promise<IListItemField> {
    const postCreateListItem = getRequestHandler<IListItemField>((params) =>
      axios.post(
        this.baseApiUrl + `v1.0/sites/${siteId}/lists/${listId}/items`,
        { fields },
        params
      )
    );

    const params: AxiosRequestConfig = {
      ...this.baseParams,
      headers: {
        ...this.baseParams.headers,
        "Content-Type": "application/json",
      },
    };

    const res = await postCreateListItem(params);

    if (!res.success)
      throw Error("ERROR: postCreateListItem - " + res.error.message);

    return res.data;
  }

  // TODO: Broken - Maybe caused by request data format update TBD
  async patchUpdateListItem(
    siteId: string,
    listId: string,
    itemId: string,
    fields: { [key: string]: string }
  ): Promise<IListItem> {
    const patchUpdateListItem = getRequestHandler<IListItem>((params) =>
      axios.patch(
        this.baseApiUrl +
          `v1.0/sites/${siteId}/lists/${listId}/items/${itemId}/fields`,
        params
      )
    );

    const params: AxiosRequestConfig = {
      ...this.baseParams,
      headers: {
        ...this.baseParams.headers,
        "Content-Type": "application/json",
      },
      data: { fields },
    };

    const res = await patchUpdateListItem(params);

    if (!res.success)
      throw Error("ERROR: patchUpdateListItem - " + res.error.message);

    return res.data;
  }
  // TODO: Broken - Maybe caused by request data format update TBD
  async deleteListItem(
    siteId: string,
    listId: string,
    itemId: string
  ): Promise<void> {
    const deleteListItem = getRequestHandler<void>((params) =>
      axios.delete(
        this.baseApiUrl +
          `v1.0/sites/${siteId}/lists/${listId}/items/${itemId}`,
        params
      )
    );

    const res = await deleteListItem(this.baseParams);

    if (!res.success)
      throw Error("ERROR: deleteListItem - " + res.error.message);

    return res.data; // RETURN HTTP/1.1 204 No Content
  }

  async getDrives(siteId: string, driveName?: string): Promise<IDrives> {
    const getDrives = getRequestHandler<IDrives>((params) =>
      axios.get(this.baseApiUrl + `v1.0/sites/${siteId}/drives/`, params)
    );

    const res = await getDrives(this.baseParams);

    if (!res.success) throw Error("ERROR: getDrives - " + res.error.message);
    let drives = res.data;
    if (driveName)
      drives = {
        ...drives,
        value: drives.value.filter((site) => site.name === driveName),
      };
    return drives;
  }

  async getDriveItems(siteId: string, driveId: string): Promise<IDriveItems> {
    const getDriveItems = getRequestHandler<IDriveItems>((params) =>
      axios.get(
        this.baseApiUrl +
          `v1.0/sites/${siteId}/drives/${driveId}/root/children`,
        params
      )
    );

    const res = await getDriveItems(this.baseParams);

    if (!res.success)
      throw Error("ERROR: getDriveItems - " + res.error.message);

    return res.data;
  }

  async getDriveItemByFileName(
    siteId: string,
    driveId: string,
    itemName: string,
    loadContent?: boolean
  ): Promise<IDriveItem> {
    const getDriveItemByFileName = getRequestHandler<IDriveItem>((params) =>
      axios.get(
        this.baseApiUrl +
          `v1.0/sites/${siteId}/drives/${driveId}/root:/${
            loadContent ? `${itemName}:/content` : itemName
          }`,
        params
      )
    );

    const res = await getDriveItemByFileName(this.baseParams);

    if (!res.success)
      throw Error("ERROR: getDriveItemByFileName - " + res.error.message);

    return res.data;
  }

  async getDriveItemById(
    siteId: string,
    driveId: string,
    itemId: string,
    loadContent?: boolean
  ): Promise<IDriveItem> {
    const getDriveItemById = getRequestHandler<IDriveItem>((params) =>
      axios.get(
        this.baseApiUrl +
          `v1.0/sites/${siteId}/drives/${driveId}/items/${
            loadContent ? `${itemId}/content` : itemId
          }`,
        params
      )
    );

    const res = await getDriveItemById(this.baseParams);

    if (!res.success)
      throw Error("ERROR: getDriveItemById - " + res.error.message);

    return res.data;
  }

  async putUploadDriveItem(
    siteId: string,
    driveId: string,
    fileName: string,
    data: any,
    folder?: string
  ): Promise<IDriveItem> {
    const putUploadDriveItem = getRequestHandler<IDriveItem>((params) =>
      axios.put(
        this.baseApiUrl +
          `v1.0/sites/${siteId}/drives/${driveId}/root:/${
            folder ? `${folder}` : ""
          }${fileName}:/content`,
        data,
        params
      )
    );

    const res = await putUploadDriveItem(this.baseParams);

    if (!res.success)
      throw Error("ERROR: putUploadDriveItem - " + res.error.message);

    return res.data;
  }

  async deleteDriveItem(
    siteId: string,
    driveId: string,
    itemId: string
  ): Promise<IDriveItem> {
    const deleteDriveItem = getRequestHandler<IDriveItem>((params) =>
      axios.delete(
        this.baseApiUrl +
          `v1.0/sites/${siteId}/drives/${driveId}/items/${itemId}`,
        params
      )
    );

    const res = await deleteDriveItem(this.baseParams);

    if (!res.success)
      throw Error("ERROR: deleteDriveItem - " + res.error.message);

    return res.data;
  }
}

export { GraphApiQuery };
