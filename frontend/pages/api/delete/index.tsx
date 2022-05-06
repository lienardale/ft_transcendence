import { IncomingForm } from 'formidable';

var fs = require('fs');

export const config = {
    api: {
       bodyParser: false,
    }
};

export default async (req : any, res : any) => {
    const data = await new Promise((resolve, reject) => {
        const form = new IncomingForm()
        form.parse(req, (err : any, fields : any) => {
			if (err) return reject(err)
            if (fs.existsSync(`./public${fields.old_avatar}`))
                fs.unlinkSync(`./public${fields.old_avatar}`)
            res.status(200).json({ fields })
			return resolve(res)
        })
    })
    return data;
}