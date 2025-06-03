class ApiResponse{
    constructor(statusCode, data, message = "Success" ){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400; // success if status code is less than 400
    }
}