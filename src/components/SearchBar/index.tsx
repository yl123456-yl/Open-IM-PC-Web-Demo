import {
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Input, Dropdown, Button, Menu } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

export type SearchBarProps = {
  menus:menuItem[];
  searchCb:(value:string)=>void;
}

type menuItem = {
  title:string
  icon:JSX.Element
  method:(idx:number)=>void
}

export const SearchBar= ({menus,searchCb}:SearchBarProps) => {
  const [text,setText] = useState("")
  const { t } = useTranslation();

  const addMenu = () => (
    <Menu className={styles.btn_menu}>
      {menus?.map((m,idx) => (
        <Menu.Item key={m.title} onClick={()=>m.method(idx)} icon={m.icon}>
          {m.title}
        </Menu.Item>
      ))}
    </Menu>
  );

  const onChanged = (v:string) => {
    if(v===""){
      searchCb("")
    }
    setText(v)
  }

  return (
    <div className={styles.top_tools}>
      <Input allowClear onPressEnter={()=>searchCb(text)} onChange={(v)=>onChanged(v.target.value)} placeholder={t("Search")} prefix={<SearchOutlined />} />
      <Dropdown
        overlay={addMenu}
        placement="bottomCenter"
        arrow
      >
        <Button
          style={{ marginLeft: "14px" }}
          shape="circle"
          icon={<PlusOutlined style={{ color: "#bac0c1" }} />}
        />
      </Dropdown>
    </div>
  );
};
