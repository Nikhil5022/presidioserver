const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { User,Property } = require('./schemas');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const url = 'mongodb+srv://gsnagc5022:UpcJyLq7L00p5h4t@cluster0.scdenlt.mongodb.net/test';

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch(err => {
        console.error('Error occurred while connecting to MongoDB Atlas', err);
    });

app.get('/', (req, res) => {
    res.send('Hello World! Database connection successful.');
});

app.post("/register", async (req, res) => {
    try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(req.body.password, 10); // 10 is the salt rounds

        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            phoneNumber: req.body.phoneNumber
        });

        console.log('User before save:', user);

        // Save the user to the database
        await user.save();

        console.log('User after save:', user);
        console.log('User ID:', user._id);

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, 'yourSecretKey', { expiresIn: '1h' }); // Change 'yourSecretKey' to your secret key

        res.send({
            message: "User registered successfully",
            token: token,
            id: await user._id.toString()
        });
    } catch (error) {
        console.error('Error occurred during registration:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).send('User not found');
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).send('Invalid password');
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, "yourSecret", { expiresIn: '1h' }); // Change 'yourSecret' to your secret key

        res.send({
            message: "User logged in successfully",
            token: token,
            id: await user._id.toString()
        });
    } catch (error) {
        console.error('Error occurred during login:', error);
        res.status(500).send('Internal Server Error');
    }
}
);

app.post('/property', async (req, res) => { 
    try{

        const property=new Property(req.body);
        const user=await User.findOne({_id:req.body.seller});
        if(!user){
            return res.status(400).send('User not found');
        }
        user.properties.push(property._id);
        await user.save();
        await property.save();
        res.send({
            message: "Property added successfully",
            id: await property._id.toString()
        });
    }
    catch(error){
        console.error('Error occurred during adding property:', error);
        res.status(500).send('Internal Server Error');
    }
})


app.get('/allproperties', async (req, res) => {
    try {
        const properties = await Property.find();
        res.send(properties);
    } catch (error) {
        console.error('Error occurred while fetching properties:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/getUserProperties/:id', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        if (!user) {
            return res.status(400).send('User not found');
        }

        const properties = user.properties; // Assuming user.properties is an array of property IDs

        // Use Promise.all to wait for all Property.findOne operations to complete
        const userProperties = await Promise.all(properties.map(async (propertyId) => {
            const prop = await Property.findOne({ _id: propertyId });
            return prop;
        }));

        res.send(userProperties);
    } catch (error) {
        console.error('Error occurred while fetching user properties:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/getUser/:id', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        if (!user) {
            return res.status(400).send('User not found');
        }

        res.send(user);
    } catch (error) {
        console.error('Error occurred while fetching user:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.delete('/deleteProperty/:id', async (req, res) => {
    try {
        const property = await Property.findOne({ _id: req.params.id });
        if (!property) {
            return res.status(400).send('Property not found');
        }

        const user = await User.findOne({ _id: property.seller });
        if (!user) {
            return res.status(400).send('User not found');
        }

        // Remove property from user's properties array
        user.properties = user.properties.filter(propertyId => propertyId.toString() !== req.params.id);
        await user.save();

        // Delete property
        await Property.deleteOne({ _id: req.params.id });

        res.send('Property deleted successfully');
    } catch (error) {
        console.error('Error occurred while deleting property:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.put('/updateProperty/:id', async (req, res) => {
    try {
        const property = await Property.findOne({ _id: req.params.id });
        if (!property) {
            return res.status(400).send('Property not found');
        }

        const user = await User.findOne({ _id: property.seller });
        if (!user) {
            return res.status(400).send('User not found');
        }

        // Update property
        await Property.updateOne({ _id: req.params.id }, req.body);

        res.send('Property updated successfully');
    } catch (error) {
        console.error('Error occurred while updating property:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/likeProperty/:id', async (req, res) => {
    try {
        const property = await Property.findOne({ _id: req.params.id });
        if (!property) {
            return res.status(400).send('Property not found');
        }
        
        // Update likes count
        property.likes += 1;
        await property.save();

        res.send(property)
    } catch (error) {
        console.error('Error occurred while liking property:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
