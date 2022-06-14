import { IncomingForm } from 'formidable';

var fs=require('fs');

export const config = {
    api: {
       bodyParser: false,
    }
};

function check(headers : any, buffer : any) {
  if(headers.length > buffer.length)
    return false;
  for (let i = 0 ; headers[i]; i++){
    if (headers[i] !== buffer[i])
      return false;
  }
  return true;
}

export default async (req : any, res : any) => {
    const data = await new Promise((resolve, reject) => {
        const form = new IncomingForm()
        form.parse(req, (err : any, fields : any, files : any) => {
          if (err) return reject(err)
            fs.stat(files.file.filepath, function(err: any, stats: any) {
              if (err) return reject(err)
             const fileSize = stats.size;
             if (stats.size > 5000000){
              res.status(300).json({ fields, files })
              return resolve(res)
             }
             const bytesToRead = fileSize < 10 ? fileSize : 10; 
             const position = 0;   
              fs.open(files.file.filepath, 'r', function(errOpen: any, fd: any) {
                if (errOpen) return reject(errOpen)
                fs.read(fd, Buffer.alloc(bytesToRead), 0, bytesToRead, position, function(errRead: any, bytesRead: any, buffer: any) {
                  if (errRead) return reject(errRead)

                  if (check([0xff, 0xd8, 0xff], buffer) === true || check([0x89,   0x50,   0x4e,   0x47,   0x0d,   0x0a,   0x1a,   0x0a], buffer) === true){
                    res.status(200).json({ fields, files })
                    return resolve(res)
                  } else {
                    res.status(300).json({ fields, files })
                    return resolve(res)
                  }
                });
              });
            });
        })
    })
	return data;
}