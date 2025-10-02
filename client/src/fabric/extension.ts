import * as fabric from "fabric";

const extraProps = ["id", "zIndex", "name"];

fabric.Object.prototype.toObject = (function (toObject) {
  return function (this: fabric.Object, properties?: any) {
    return {
      ...toObject.call(this, properties),
      ...extraProps.reduce((acc, key) => {
        acc[key] = (this as any)[key];
        return acc;
      }, {} as Record<string, any>),
    };
  };
})(fabric.Object.prototype.toObject);