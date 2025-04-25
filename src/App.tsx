import { useState } from 'react'
import './App.css'

import { MapsChart } from '@highcharts/react/Maps';
import { MapSeries } from '@highcharts/react/series/Map';

import { Legend } from '@highcharts/react/options'

import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

const availableMaps = {
    'Europe': 'custom/europe',
    'North America': 'custom/north-america',
    'South America': 'custom/south-america',
    'Africa': 'custom/africa',
    'Asia': 'custom/asia',
    'Oceania': 'custom/oceania',
    'Norway kommuner': 'countries/no/no-all-all',
    'Norway fylker': 'countries/no/no-all',
    'States of the United States': 'countries/us/us-all',
    'United Kingdom': 'countries/gb/custom/gb-countries'
};

export function Map({ typedKeys, mapData }) {
    return (
        <MapsChart
            options={{
                chart: {
                    height: '500px',
                    map: mapData
                },
                mapNavigation: {
                    enabled: true
                }
            }}
        >
            <MapSeries
                dataLabels={{
                    enabled: true,
                    format: '{#if point.value ne 600}📌{/if}'
                }}
                data={
                    typedKeys.map((word: string) => {
                        return {
                            'hc-key': word,
                            value: 1
                        }
                    })
                }
            />
            <Legend enabled={false} />
        </MapsChart>
    );
}

export function Confetti(){
return (
    <div className="confetti-container">
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
    </div>
       );
}

export function CountryList({ typedKeys, countries }) {
    return (
        <details>
            <summary>
                View gotten countries
            </summary>
            <ol>
                {typedKeys.map(w => <li>{countries.find(c => c.key === w)?.name ?? '???'}</li>)}
            </ol>
        </details>
    )
}

export function TypeGame({ region }) {
    const [typedKeys, setTypedKeys] = useState<string[]>([]);
    const [badGuesses, setBadGuesses] = useState(0);

    function reset() {
        setTypedKeys([]);
        setBadGuesses(0);
    }

    const { isPending, error, data } = useQuery({
        queryKey: ['map', region],
        queryFn: async () => {
            const mapData = await fetch(`https://code.highcharts.com/mapdata/${region}.geo.json`)
                .then(res => res.json());

            const { features: countries } = mapData;

            const countryMap = countries.map((country) => {
                return {
                    name: country.properties.name,
                    key: country.properties["hc-key"],
                    typed: false
                };
            });

            reset();

            return { mapData, countryMap }
        },
        refetchOnWindowFocus: false,
    });


    if (isPending) return 'Loading...';

    if (error) return 'An error has occurred: ' + error.message

    function handleSubmit(e) {
        const formdata = new FormData(e.target);

        const typed = formdata.get("typed-country");
        const found = data?.countryMap.find(c => c.name.toLowerCase() === typed.toLowerCase());


        if (found) {
            if (typedKeys.includes(found.key.toLowerCase())) {
                // @todo: maybe add a message
                return;
            }

            setTypedKeys([...typedKeys, found.key.toLowerCase()])
            return;
        }
        
        setBadGuesses(badGuesses + 1)
    }

    return (
        <>
            <div id='status-bar'>
                <dl>
                    <dt>Total countries</dt>
                    <dd>{data.countryMap.length}</dd>
                    <dt>Found</dt>
                    <dd>{typedKeys.length}</dd>
                    <dt>Bad guesses</dt>
                    <dd>{badGuesses}</dd>
                </dl>

                {typedKeys.length === data.countryMap.length && <div>You win! <Confetti /> </div>}
                {typedKeys.length === data.countryMap.length && badGuesses === 0 && <div>F-F-F-Full combo!</div>}
            </div>
            <Map typedKeys={typedKeys} mapData={data.mapData} />
            <form id="input-form" onSubmit={handleSubmit} action={() => { }}>
                <label>
                    Enter country:
                    <input name="typed-country" type="text" autoComplete='off' />
                </label>
                <button type="submit">Submit</button>
            </form>
            <CountryList typedKeys={typedKeys} countries={data.countryMap} />
        </>
    )
}


const queryClient = new QueryClient();

function MapPicker({ currentRegion, onChange }){
    return (
        <label>
        Select region
            <select onChange={(e) =>{onChange(e.target.value)}}>
            {Object.entries(availableMaps).map(([name, key]) => (
                <option key={key} value={key}>{name}</option>
            ))}
            </select>
        </label>
    )
}

export function App() {
    const [region, setRegion] = useState(Object.values(availableMaps)[0])

    return (
        <QueryClientProvider client={queryClient}>
            <MapPicker currentRegion={region} onChange={(r) => setRegion(r)} />
            <TypeGame region={region} />
        </QueryClientProvider>
    )
}

export default App;
