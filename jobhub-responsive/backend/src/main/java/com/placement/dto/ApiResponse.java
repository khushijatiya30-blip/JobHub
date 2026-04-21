package com.placement.dto;
public class ApiResponse {
    private boolean success; private String message; private Object data;
    public ApiResponse() {}
    public ApiResponse(boolean success, String message, Object data) {
        this.success=success; this.message=message; this.data=data;
    }
    public boolean isSuccess(){return success;} public void setSuccess(boolean s){success=s;}
    public String getMessage(){return message;} public void setMessage(String m){message=m;}
    public Object getData(){return data;} public void setData(Object d){data=d;}
    public static ApiResponse success(String message, Object data){ return new ApiResponse(true,message,data); }
    public static ApiResponse success(String message){ return new ApiResponse(true,message,null); }
    public static ApiResponse error(String message){ return new ApiResponse(false,message,null); }
}
