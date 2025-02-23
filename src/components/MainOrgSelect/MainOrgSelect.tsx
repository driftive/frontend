import React from "react";
import Select, {
  components,
  GroupBase,
  OptionProps,
  ActionMeta,
  SingleValue
} from "react-select";

type OptionType = {
  value: string;
  label: string;
  image: string;
  installed: boolean;
};

export interface MainOrgSelectProps {
  options: OptionType[];
  onChange: (newValue: SingleValue<OptionType>, action: ActionMeta<OptionType>) => void;
}

// Custom Option component to render image and label
const CustomOption = (
  props: OptionProps<OptionType, false, GroupBase<OptionType>>
) => {

  // const badgeStyle = {
  //   padding: '2px 8px',
  //   borderRadius: '12px',
  //   backgroundColor: props.data.installed ? 'rgba(0, 128, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
  //   color: props.data.installed ? 'green' : 'red',
  //   fontSize: '12px'
  // };

  return (
    <components.Option {...props}>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <img
          src={props.data.image}
          alt={props.data.label}
          style={{width: '24px', height: '24px', marginRight: '8px'}}
        />
        <span>{props.data.label}</span>
        {props.data.installed ? (
          <span style={{marginLeft: 'auto', color: 'green'}}>Installed</span>
        ) : (
          <span style={{marginLeft: 'auto', color: 'red'}}>Not Installed</span>
        )}
      </div>
    </components.Option>
  );
};

const MainOrgSelect: React.FC<MainOrgSelectProps> = ({options, onChange}) => {
  return (
    <Select
      options={options}
      onChange={onChange}
      components={{Option: CustomOption}}
      placeholder="Select an organization..."
    />
  );
};

export default MainOrgSelect;
