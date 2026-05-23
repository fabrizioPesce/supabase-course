import { useEffect, useState } from "react";
import supabase from "./supabase-client";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import Form from "./Form";

function Dashboard() {
    const [metrics, setMetrics] = useState([]);

    async function fetchMetrics() {

        /*
            This syntax gives you the name with
            the greatest value in the table

            const { data, error } = await supabase
                .from('sales_deals')
                .select('name, value')
                .order('value', { ascending: false })
                .limit(1);
    
            console.log(data);
        */

        /*
            Since you can't no more aggregate using PostgREST, 
            I've made a view in my db
            
            const response = await supabase
                .from('sales_deals_summary')
                .select('name, total_value')
                
            console.log(response);

            If you don't want to create a new view
            you can still run this tho running this query before
            
            ALTER ROLE authenticator SET pgrst.db_aggregates_enabled = 'true';
            NOTIFY pgrst, 'reload config';

            const response = await supabase
            .from('sales_deals')
            .select('name, value.sum()')
            
            console.log(response);

        */

        try {
            const { data, error } = await supabase
                .from('sales_deals')
                .select('name, value.sum()')

            if (error) {
                throw error;
            }

            setMetrics(data);
            console.log(data);
        } catch (e) {
            console.log(`An error as occured: ${e}`);
        }


    }

    useEffect(() => {
        fetchMetrics();

        const channel = supabase
            .channel('deal-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'sales_deals'
                },
                (payload) => {
                    fetchMetrics();
                })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const data = metrics.map((m) => ({
        name: m.name,
        value: m.sum
    }));

    return (
        <>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar type="monotone" dataKey="value" stroke="#8884d8" fill="white" />
                </BarChart>
            </ResponsiveContainer>
            <Form metrics={metrics}/>
        </>
    )
}

export default Dashboard;