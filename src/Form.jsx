import { useState, useEffect } from "react";
import supabase from "./supabase-client";

function Form({ metrics }) {
    const [newDeal, setNewDeal] = useState({
        name: '',
        value: 0
    });

    useEffect(() => {
        if (metrics && metrics.length > 0) {
            setNewDeal({
                name: metrics[0].name,
                value: 0
            });
        }
    }, [metrics]);

    async function addDeal() {
        try {
            const { error } = await supabase
                .from('sales_deals')
                .insert(newDeal)
            
            if(error){
                throw error;
            }
        } catch (e) {
            console.log(`An error as occured: ${e}`);
        }

    }

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(newDeal);
        addDeal();
        setNewDeal({
            name: metrics[0].name,
            value: 0
        });

    }

    const handleChange = (event) => {
        const eventName = event.target.name;
        const eventValue = event.target.value;
        setNewDeal(prevState => ({
            ...prevState,
            [eventName]: eventValue
        }));
    }

    const generateOptions = () => {
        return metrics?.map((metric) => (
            <option key={metric.name} value={metric.name}>
                {metric.name}
            </option>
        ));
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <label>Name:
                    <select value={newDeal.name} onChange={handleChange} name="name">
                        {generateOptions()}
                    </select>
                </label>
                <label>Amount: $
                    <input
                        type="number"
                        name="value"
                        value={newDeal.value}
                        onChange={handleChange}
                        className="amount-input"
                        min="0"
                        step="10"
                    />
                </label>
                <button>Add Deal</button>
            </form>
        </div>
    );
}

export default Form;