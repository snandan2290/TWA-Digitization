exports.getPageoffset = function(page, pageSize) {
    //As the page count starts with 0
    let offset = (parseInt(page) - 1) * parseInt(pageSize);
    
    return { "offset" : offset,
             "limit" : pageSize
    };
};