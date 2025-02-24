import React from "react";
import Select, {ActionMeta, components, GroupBase, OptionProps, SingleValue, StylesConfig} from "react-select";

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

const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '48px',
    borderRadius: '8px',
    borderColor: state.isFocused ? '#2684FF' : provided.borderColor,
    boxShadow: state.isFocused ? '0 0 0 2px rgba(38, 132, 255, 0.3)' : provided.boxShadow,
    '&:hover': {
      borderColor: '#2684FF'
    },
  }),
  option: (provided, state) => ({
    ...provided,
    padding: '8px 12px',
    fontSize: '16px',
    backgroundColor: state.isSelected
      ? '#e6f7ff'
      : state.isFocused
        ? '#f5faff'
        : 'white',
    color: '#333',
    '&:active': {
      backgroundColor: state.isSelected ? '#e6f7ff' : '#f0f0f0'
    }
  }),
  singleValue: (provided) => ({
    ...provided,
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px'
  })
};

const CustomOption = (
  props: OptionProps<OptionType, false, GroupBase<OptionType>>
) => {

  const badgeStyle = {
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: props.data.installed ? 'rgba(0, 128, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
    color: props.data.installed ? 'green' : 'red',
    fontSize: '12px'
  };

  return (
    <components.Option {...props}>
      <div style={{display: 'flex', alignItems: 'center', padding: '8px 12px'}}>
        <img
          src={props.data.image}
          alt={props.data.label}
          style={{
            width: '42px',
            height: '42px',
            marginRight: '12px',
            borderRadius: '50%'
          }}
        />
        <span style={{fontSize: '16px', fontWeight: 500, color: '#333'}}>
          {props.data.label}
        </span> <span style={{marginLeft: 'auto', ...badgeStyle}}>
          {props.data.installed ? "Installed" : "Not Installed"}
        </span>
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
      styles={customStyles}

    />
  );
};

export default MainOrgSelect;
