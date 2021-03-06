import { RightOutlined } from "@ant-design/icons";
import { Button, Input, message, Upload } from "antd";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { GroupItem } from "../../../../../@types/open_im";
import { MyAvatar } from "../../../../../components/MyAvatar";
import { cosUpload } from "../../../../../utils";

type EditDrawerProps = {
  groupInfo: GroupItem;
  changeGroupInfo: (str: string, tp: keyof GroupItem) => void;
  updateGroupInfo: () => void;
};

const EditDrawer: FC<EditDrawerProps> = ({ groupInfo, changeGroupInfo, updateGroupInfo }) => {
  const { t } = useTranslation();
  const uploadIcon = (uploadData: UploadRequestOption) => {
    cosUpload(uploadData)
      .then((res) => {
        changeGroupInfo(res.url, "faceUrl");
      })
      .catch((err) => message.error(t("UploadFailed")));
  };

  return (
    <div>
      <div className="group_drawer_item">
        <div>{t("GroupAvatar")}</div>
        <div className="group_drawer_item_right">
          <Upload accept="image/*" action={""} customRequest={(data) => uploadIcon(data)} showUploadList={false}>
            <MyAvatar size={36} shape="square" src={groupInfo?.faceUrl} />
          </Upload>
          <RightOutlined />
        </div>
      </div>
      <div className="group_drawer_row">
        <div className="group_drawer_row_title">
          <div>{t("GroupName")}</div>
        </div>
        <div style={{ marginBottom: 0 }} className="group_drawer_row_input">
          <Input key="group_name" value={groupInfo?.groupName} onChange={(e) => changeGroupInfo(e.target.value, "groupName")} placeholder="请输入群名称" />
        </div>
      </div>
      <div style={{ border: "none" }} className="group_drawer_row">
        <div className="group_drawer_row_title">
          <div>{t("GroupDesc")}</div>
        </div>
        <div style={{ marginBottom: 0 }} className="group_drawer_row_input">
          <Input.TextArea
            key="group_introduction"
            value={groupInfo?.introduction}
            onChange={(e) => changeGroupInfo(e.target.value, "introduction")}
            showCount
            autoSize={{ minRows: 4, maxRows: 6 }}
            placeholder={t("GroupDescTip")}
          />
        </div>
      </div>
      <Button onClick={updateGroupInfo} type="primary" className="single_drawer_btn">
        {t("Save")}
      </Button>
    </div>
  );
};

export default EditDrawer;
